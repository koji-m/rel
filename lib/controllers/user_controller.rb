# coding: utf-8

module Rel
  class UserController < ApplicationController

    set :erb, :escape_html => true
    
    # Sign-in form
    get '/sign_in' do
      redirect '/' if signed_in?

      @current_page = 'sign_in_page'

      erb :sign_in
    end

    # Sign-in
    post '/session' do
      redirect '/' if signed_in?

      user = User.authenticate(params[:username], params[:password])
      if user
        session[:user_id] = user.id
        redirect '/'
      else
        flash[:warn] = 'Please check your username and password'
        redirect '/user/sign_in'
      end
    end

    # Sign-in with Twitter
    get '/auth/twitter' do
      redirect '/' if signed_in?

      consumer = CONSUMER['twitter']
      
      # Note: Specify argument for out of bound
      request_token = consumer.get_request_token(oauth_callback: TW_CALLBACK_URL)
      
      session[:request_token] = request_token.token
      session[:request_token_secret] = request_token.secret

      redirect request_token.authorize_url
    end

    post '/auth/twitter' do
      redirect '/' if signed_in?

      at = OAuth::AccessToken.new(CONSUMER['twitter'],
                                  params[:access_token],
                                  params[:access_token_secret])
      user_info = {'id' => params[:uid],
        'screen_name' => params[:username],
        'profile_image_url' => params[:prof_img_url]
      }
      
      user = User.tw_authenticate(user_info, at)

      if user.class == RelSupport
        flash[:warn] = 'Username "' + user.auth_twitter['screen_name'] + '" is already used in Rel.'
        
      elsif user.errors.any?
        flash[:warn] = user.errors.messages
      else
        session[:user_id] = user.id

        redirect '/'
      end

      @uid = params[:uid]
      @screen_name = params[:username]
      @prof_img_url = params[:prof_img_url]
      @access_token = params[:access_token]
      @access_token_secret = params[:access_token_secret]
      
      erb :auth_twitter_conf
      
    end
    
    get '/auth/twitter/callback' do
      consumer = CONSUMER['twitter']

      rt = OAuth::RequestToken.new(consumer,
                                   session[:request_token],
                                   session[:request_token_secret])

      at = rt.get_access_token(oauth_verifier: params[:oauth_verifier])

      user = User.auth_twitter(at)

      if user.class == RelSupport
        flash[:warn] = 'Username "' + user.auth_twitter['screen_name'] + '" is already used in Rel.'
        @uid =  user.auth_twitter['id']
        @screen_name =  user.auth_twitter['screen_name']
        @prof_img_url = user.auth_twitter['profile_image_url']
        @access_token = at.token
        @access_token_secret = at.secret
        
        halt erb(:auth_twitter_conf)
      elsif user.errors.any?
        flash[:warn] = user.errors.messages
        redirect '/user/sign_up'
      end

      session[:user_id] = user.id

      redirect '/'
    end

    get '/user/auth/twitter/configure' do
      @uid = params[:uid]
      @screen_name = params[:screen_name]

      erb :auth_twitter_conf
    end
    
    # Sign-out
    delete '/session' do
      session.clear
      redirect '/user/sign_in'
    end

    # User registration form
    get '/sign_up' do
      redirect '/' if signed_in?

      @current_page = 'sign_up_page'
      
      erb :sign_up
    end

    # Sign-up
    post '/' do
      redirect '/' if signed_in?
      
      @username = params[:username]
      @email = params[:email]
      
      if @username && !(params[:password].empty?) && !(params[:password_confirm].empty?)
        if params[:password] == params[:password_confirm]
          user = User.new(name: @username, email: @email, password: params[:password])
          if user.save_default
            session[:user_id] = user.id
            redirect '/'
          else
            flash[:warn] = user.errors.messages
          end
        else
          flash[:warn] = {general: ['Please check your password']}
        end
      else
        flash[:warn] = {general: ['Please input all items']}
      end

      @current_page = 'sign_up_page'
      erb :sign_up
    end

    # Delete user registration
    delete '/' do
      authenticate
      if current_user.destroy
        session.clear
        flash[:warn] = 'User Account has been deleted'
        redirect '/user/sign_up'
      end
    end

    # User setting form
    get '/edit' do
      authenticate
      @current_user = current_user

      @current_page = 'setting'
      
      erb :setting
    end

    # Submit user settings
    put '/' do
      authenticate
      @current_user = current_user
      if @current_user.update({email: params[:email]})
        flash[:warn] = {general: ['Update user settings succeeded']}
      else
        flash[:warn] = @current_user.errors.messages
      end

      redirect '/user/edit'
    end

    # Submit password change
    put '/password' do
      authenticate
      @current_user = current_user
      old_password = params[:current_password]
      new_password = params[:new_password]
      new_password_confirm = params[:new_password_confirm]
      
      if old_password.empty? || new_password.empty? || new_password_confirm.empty?
        flash[:warn] = {general: ['Please input all items']}
      else
        unless @current_user.password_eq?(old_password) && (new_password == new_password_confirm)
          flash[:warn] = {general: ['Please check your password']}
          redirect '/user/edit'
        end

        @current_user.password = new_password
        @current_user.encrypt_password
        if @current_user.save
          flash[:warn] = {general: ['Update password succeeded']}
        else
          flash[:warn] = @current_user.errors.messages
        end
      end
      
      redirect '/user/edit'
    end

    # User profile & posts
    get '/:user_name' do
      @user = User.where(name: params[:user_name]).first
      unless @user
        not_found
      end
      
      @posts = Post.where(user_id: @user.id)
      
      current_uid = session[:user_id]
      uid = @user.id
      @disable_follow = !signed_in? || (current_uid == uid) || following?(current_uid, uid)

      @current_page = 'user_page'
      
      erb :user_page
    end

    # User specific posts
    get '/:user_name/post' do
      content_type :json
      
      psts = Post.user_specific_posts(params[:user_name],
                                      params[:from],
                                      params[:to],
                                      params[:num],
                                      params[:order])

      psts_data = format_post_array_for_view(psts, session[:user_id])

      {post_data: psts_data, time_stamp: psts[:time_stamp]}.to_json
    end
    
    # Follow user
    post '/:user_name/follow' do
      authenticate
      @current_user = current_user
      @target = params[:user_name]
      if @current_user.follow(@target)  # should return #<User> and get error state
        flash[:warn] = ["You followed ", @target]
      else
        flash[:warn] = ["You cannot follow ", @target]
      end
      
      redirect "/user/#{@target}"
    end
  end
end
