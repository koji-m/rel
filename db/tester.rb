require 'active_record'
require 'active_support/all'
require 'logger'
require 'yaml'

# Load configurations.
conf = YAML.load(File.read(File.expand_path('../../lib/config.yml', __FILE__)))
CONFIG = conf['development']

# <<ActiveRecord Note for Connection Pooling>>
# establish_connection actually doesn't make connection, just configuring.
# Connection will be made when connection (which is called by query methods) is called.
db_conf = CONFIG['database']
ActiveRecord::Base.establish_connection("adapter" => db_conf['adapter'],
                                        "database" => db_conf['dbfile'])

Dir.glob("../lib/helpers/*.rb").each do |file|
  require file
end

Dir.glob("../lib/models/*.rb").each do |file|
  require file
end

ActiveRecord::Base.logger = Logger.new(STDOUT)


