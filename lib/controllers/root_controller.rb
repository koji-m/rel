# coding: utf-8

module Rel
  class RootController < ApplicationController

    set :erb, :escape_html => true
    
    # Home
    get '/' do
      authenticate

      @current_user = current_user
      @posts = Post.find_associative_posts(@current_user.id,
                                           params[:from],
                                           params[:to],
                                           '20',
                                           'desc')
      @current_page = 'home'
      
      erb :home
    end

    # List of user whom you follow
    get '/following' do
      
    end

    # List of your follower
    get '/follower' do
      
    end

    # Notifications
    get '/notification' do
      
    end

    # Search page
    get '/search' do
      @query_word = params[:q]
      
      erb :search
    end
    
    # Search query result
    get '/query' do
      content_type :json

      psts = Post.search_by_hashtag(params[:q], params[:num], params[:order],\
                                    params[:from], params[:to], params[:opt])
      
      psts_data = format_post_array_for_view(psts, session[:user_id])

      {post_data: psts_data, time_stamp: psts[:time_stamp]}.to_json
    end

    # JavaScript
    get '/script/:filter_value' do
      content_type :js

      return "" if params[:filter_value].nil? || params[:filter_value] == ""

      @parm = params[:filter_value].sub(/\?.*/, '').split('!', 0).map do |elm|
        elm.split('_').map{|n| n.to_i}
      end
      
      erb :filter, layout: false
    end
    
  end
end
