require "bundler/gem_tasks"

require "yaml"
require "dotenv/tasks"

namespace :app do
  desc 'initialize application'
  task :init => :dotenv do
    conf = YAML.load(File.read(File.expand_path('../lib/config.yml', __FILE__)))

    CONFIG = conf[ENV['RACK_ENV']]
    CONFIG['database']['url'] = ENV['DATABASE_URL']
    CONFIG['session']['secret'] = ENV['SESSION_SECRET']
    CONFIG['openssl']['common-key-crypt']['at-key'] = ENV['SSL_AT_KEY']
    CONFIG['openssl']['common-key-crypt']['ats-key'] = ENV['SSL_ATS_KEY']
    CONFIG['oauth']['twitter']['consumer_key'] = ENV['TW_CKEY']
    CONFIG['oauth']['twitter']['consumer_secret'] = ENV['TW_CSEC']
    CONFIG['oauth']['twitter']['callback'] = ENV['TW_CALLBACK']

    File.open(File.expand_path('../lib/config.yml', __FILE__), 'w') do |file|
      file.write(YAML.dump(conf))
    end
    
  end

  desc 'generate .env template'
  task :env do
    File.open('./.env', 'w') do |file|
  file.write(<<EOF)
RACK_ENV=
SESSION_SECRET=
SSL_AT_KEY=
SSL_ATS_KEY=
TW_CKEY=
TW_CSEC=
TW_CALLBACK=
TYPEKIT_URL=
EOF
    end
  end
end

namespace :db do
  desc 'initialize database'
  task :init => :dotenv do
    require_relative "db/schema.rb"
  end

  desc 'drop all tables'
  task :drop => :dotenv do
    require_relative "db/drop.rb"
  end
end


