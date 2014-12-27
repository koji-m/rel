# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'rel/version'

Gem::Specification.new do |spec|
  spec.name          = "rel"
  spec.version       = Rel::VERSION
  spec.authors       = ["Koji Matsumoto"]
  spec.email         = ["otomustam.ijok@gmail.com"]
  spec.summary       = %q{rel: chart posting application}
  spec.description   = %q{chart posting application.}
  spec.homepage      = ""
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0")
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.6"
  spec.add_development_dependency "rake"
  spec.add_development_dependency "yard"
  spec.add_development_dependency "redcarpet"
  spec.add_development_dependency "sinatra-reloader"
  spec.add_development_dependency "sqlite3"

  spec.add_dependency "activerecord"
  spec.add_dependency "sinatra"
  spec.add_dependency "oauth"
  spec.add_dependency "rack-flash3"
  spec.add_dependency "erubis"
  spec.add_dependency "mail"
  spec.add_dependency "mimemagic"
  spec.add_dependency "dotenv"
end
