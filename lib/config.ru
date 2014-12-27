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
ActiveRecord::Base.establish_connection(ENV['DATABSE_URL'])

# Load Models, Helpers.
Dir.glob("./lib/{helpers,models}/*.rb").each do |file|
  require file
end

require './lib/controllers/application_controller.rb'

Dir.glob("./lib/controllers/*.rb").each do |file|
  require file
end


# Initialize OAuth Consumer for Twitter.
twitter_conf = CONFIG['oauth']['twitter']
CONSUMER = {'twitter' => OAuth::Consumer.new(ENV['TW_CKEY'],
                                             ENV['TW_CSEC'],
                                             twitter_conf['options'])}

# Twitter API constants
TW_CALLBACK_URL = ENV['TW_CALLBACK']
TW_API_USER_INFO = twitter_conf['api']['user_info']

# SSL secret for OAuth Access Token
AT_KEY = ENV['SSL_AT_KEY']
ATS_KEY = ENV['SSL_ATS_KEY']

# Use HTTP method overriding.
use Rack::MethodOverride

# Use Cookie based Session.
# Only session-id is stored in session. Session data is in @pool.
session_conf = CONFIG['session']
session_conf['secret'] = ENV['SESSION_SECRET']
use Rack::Session::Pool, session_conf

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

