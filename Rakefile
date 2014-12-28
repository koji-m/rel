require "bundler/gem_tasks"

require "yaml"
require "dotenv/tasks"

namespace :app do
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


