require 'json'
require 'pathname'

def use_expo_modules!(custom_options = {})
  # `self` points to Pod::Podfile object
  # `current_target_definition` is the target that is currently being visited by CocoaPods
  Autolinking.new(self, current_target_definition).useExpoModules!(custom_options)
end

# Deprecated, use `use_expo_modules!` instead.
def use_unimodules!(custom_options = {})
  use_expo_modules!(custom_options)
end

# Implement stuff in the class, so we can make some helpers private and don't expose them outside.
class Autolinking
  def initialize(podfile, target)
    @podfile = podfile
    @target = target
  end

  def useExpoModules!(custom_options = {})
    options = {}.merge(custom_options);

    paths = options.fetch(:modules_paths)
    flags = options.fetch(:flags, {})
    exclude = options.fetch(:exclude, [])

    project_directory = Pod::Config.instance.project_root

    config = loadConfig!(paths)

    if config.nil?
      return
    end

    logs = config["logs"]

    if !logs.empty?
      puts logs, ""
    end

    linkedModules = []

    config["expo-modules"].each { |expoModule|
      # JavaScript package name
      moduleName = expoModule["name"]

      podName = expoModule["podName"]
      podPath = expoModule["path"]

      if exclude.include?(moduleName) || hasDependency?(podName)
        # This module was requested to be excluded or its pod is already installed.
        next
      end

      # Install the pod.
      @podfile.pod podName, {
        path: Pathname.new(podPath).relative_path_from(project_directory)
      }.merge(flags)

      linkedModules << podName
    }

    puts "Linked module: #{linkedModules}"
  end

  private

  def loadConfig!(paths = nil)
    json = []
    args = ["node", "../node_modules/.bin/expo-module-autolinking", "search"]

    if !paths.nil?
      args.concat(paths)
    end

    IO.popen() do |data|
      while line = data.gets
        json << line
      end
    end

    begin
      JSON.parse(json.join())
    rescue => error
      puts "Couldn't parse JSON coming from `expo-module-autolinking` command: #{error}"
    end
  end

  def hasDependency?(pod_name)
    return @target.dependencies.any? { |d| d.name == pod_name }
  end
end
