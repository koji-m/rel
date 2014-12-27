# coding: utf-8

require 'sinatra/base'


module Rel
  class ApplicationController < Sinatra::Base
    
    # Configure global settings
    configure do

      # Set view file directory to 'APP_ROOT/lib/views'
      set :views, File.expand_path('../../views', __FILE__)

      # Set static file directory to 'APP_ROOT/lib/public'
      set :public_folder, File.expand_path('../../public', __FILE__)

      # Enable session
      #set :sesions, CONFIG['session'];

    end

    # Configure development settings
    configure :development do
      require 'sinatra/reloader'
      register Sinatra::Reloader
      require 'logger'
      ActiveRecord::Base.logger = Logger.new(STDOUT)
    end

    
    # Include helpers
    helpers ApplicationHelper


    # Error handling: 404 Not Found
    not_found do
      erb :not_found
    end

    # Error handling: 500 Internal Server Error
    error do
      erb :internal_server_error
    end

  end
end
