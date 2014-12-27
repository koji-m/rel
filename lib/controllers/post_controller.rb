# coding: utf-8

module Rel
  class PostController < ApplicationController

    set :erb, :escape_html => true
    
    # List of post associated with a user
    get '/' do
      authenticate
      content_type :json
      
      psts = Post.find_associative_posts(session[:user_id],
                                         params[:from],
                                         params[:to],
                                         params[:num],
                                         params[:order])

      psts_data = format_post_array_for_view(psts, session[:user_id])

      {post_data: psts_data, time_stamp: psts[:time_stamp]}.to_json
    end

    # Submit post
    post '/' do
      authenticate

      save_post params[:comment], params[:data], params[:option], params[:chrt_id],
                params[:quote_id], params[:reply_id]
      
    end

    # Post form
    get '/new' do
      authenticate
      if @chrt_id = params[:chart_id]
        if Chart.editable?(@chrt_id, session[:user_id])
          # post form with existing chart
          
          erb :new_post
        end
        @chrt_id = nil
        flash[:warn] = 'You cannot edit the chart'
      end
      # post form with new chart
      
      
      erb :new_post
    end

    # Specific post
    get '/:post_id' do
      
    end

    # Submit editing of a post
    put '/:post_id' do
      
    end

    # Delete post
    delete '/:post_id' do
      
    end

    # Post editing form
    get '/:post_id/edit' do
      
    end
    
  end
end
