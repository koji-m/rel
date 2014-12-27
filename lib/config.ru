# coding: utf-8

require 'sinatra/base'
require 'rack-flash'
require 'active_record'
require 'active_support/all'
require 'yaml'
require 'json'
require 'oauth'
require 'openssl'
require 'base64'
require 'erubis'

# Load configurations.
conf = YAML.load(File.read(File.expand_path('../config.yml', __FILE__)))
CONFIG = conf[ENV['RACK_ENV']]

# <<ActiveRecord Note for Connection Pooling>>
# establish_connection actually doesn't make connection, just configuring.
# Connection will be made when connection (which is called by query methods) is called.
db_conf = CONFIG['database']
ActiveRecord::Base.establish_connection(db_conf['url'])

# Load Models, Controllers, Helpers.
Dir.glob("./{helpers,models,controllers}/*.rb").each do |file|
  require file
end

# Initialize OAuth Consumers.
# conf[0]: provider name, conf[1]: settings for the provider.
oauth_conf = CONFIG['oauth']
CONSUMER = oauth_conf.each_with_object({}) do |conf, h|
  h.merge! ({ conf[0] => OAuth::Consumer.new(conf[1]['consumer_key'],
                                             conf[1]['consumer_secret'],
                                             conf[1]['options'])})
end

# Twitter API constants
twitter_conf = oauth_conf['twitter']
TW_CALLBACK_URL = twitter_conf['callback']
TW_API_USER_INFO = twitter_conf['api']['user_info']

# SSL secret for OAuth Access Token
AT_KEY = CONFIG['openssl']['common-key-crypt']['at-key']
ATS_KEY = CONFIG['openssl']['common-key-crypt']['ats-key']

# Use HTTP method overriding.
use Rack::MethodOverride

# Use Cookie based Session.
# Only session-id is stored in session. Session data is in @pool.
use Rack::Session::Pool, CONFIG['session']

# Use Web Security Suite
# By default, CSRF protection is implemeted by session-based,
# and Referer consistency check.
# If required, form-based CSRF token check should be used.
use Rack::Protection

# Use Session based Flash.
# Sweep even if not used the value.
use Rack::Flash, :sweep => true

# Use ActiveRecord ConnectionManagement.
# This is required for auto disconnection(release connection) after query method call.
use ActiveRecord::ConnectionAdapters::ConnectionManagement


# Set routing for controllers.
map('/user') { run Rel::UserController }

map('/post') { run Rel::PostController }

map('/chart') { run Rel::ChartController }

map('/') { run Rel::RootController }

