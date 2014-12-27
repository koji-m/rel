# coding: utf-8

module ApplicationHelper

  EDIT_BUTTON = "<button type=\"button\" class=\"start-edit-btn btn btn-default\" data-chart-id=\"%s\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Edit\"><span class=\"glyphicon glyphicon-edit\" aria-hidden=\"true\"></span> </button>"

  QUOTE_BUTTON = "<button type=\"button\" class=\"quote-btn btn btn-default\" data-post-id=\"%s\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Quote\"><span class=\"glyphicon glyphicon-retweet\" aria-hidden=\"true\"></span> </button>"

  REPLY_BUTTON = "<button type=\"button\" class=\"reply-btn btn btn-default\" data-post-id=\"%s\" data-toggle=\"tooltip\" data-placement=\"top\" title=\"Reply\"><span class=\"glyphicon glyphicon-share-alt\" aria-hidden=\"true\"></span> </button>"
  
  # check sign-in status
  def signed_in?
    !!session[:user_id]
  end

  # return current session user
  def current_user
    return unless session[:user_id]
    User.find(session[:user_id])
  end

  # redirect to sign-in page if not signed-in
  def authenticate
    unless signed_in?
      flash[:warn] = {general: ['Please sign in']}
      redirect '/user/sign_in'
    end
    true
  end

  def following?(current_uid, target_uid)
    followee_ids = Follow.where(user_id: current_uid).pluck(:followee)
    followee_ids.include? target_uid
  end
  
  def format_post_array_for_view(posts, current_uid)
    post_array = posts[:data]
    reply_of = posts[:reply_of]
    
    proc_post = Proc.new do |pst|
      next nil if pst.nil?
      
      quote, comment = format_quote_data(pst)
      
      if quote.nil? && pst.user_id == current_uid && pst.id == Post.where(chart_id: pst.chart_id).last.id
        edit_button = EDIT_BUTTON % pst.chart_id
      else
        edit_button = ""
      end

      if signed_in?
        quote_id = pst.id
        quote_id = pst.quote if pst.quote > 0
        
        quote_button = QUOTE_BUTTON % quote_id

        reply_button = REPLY_BUTTON % pst.id
      else
        quote_button = ""
        reply_button = ""
      end

      {id: pst.id, user_name: pst.user.name, comment: comment,
        chart_id: pst.chart_id, quote: quote, reply_to: pst.reply_to,
        updated_at: (pst.updated_at.to_f * 1000).floor,
        edit_button: edit_button, quote_button: quote_button,
        reply_button: reply_button
      }
    end

    reply_of.each do |rpl|
      post_array.each_index do |idx|
        post_array[idx] = nil if post_array[idx].eql?(rpl)
      end
    end

    
    {posts: post_array.map(&proc_post), reply_of: reply_of.map(&proc_post)}
  end

  def format_quote_data(pst)
    if pst.quote > 0 && /^QT @(.+) / === pst.comment
      quote_post = Post.where(id: pst.quote).first
      [{quote_id: pst.quote, name: quote_post.user.name,
        updated_at: (quote_post.updated_at.to_f * 1000).floor},
       pst.comment.sub(/^QT @(.+) /, '')]
    else
      [nil, pst.comment]
    end
  end
  
  def save_post(comment, data, option, chart_id, quote_id, reply_id)
    if quote_id
      Post.transaction do
        qid = quote_id.to_i
        pst = Post.new(user_id: session[:user_id], comment: comment, quote: qid)
        pst.save!
        Chart.save_quoted_chart(pst, qid)
      end
    elsif reply_id
      Post.transaction do
        repid = reply_id.to_i
        pst = Post.new(user_id: session[:user_id], comment: comment,
                       quote: -1, reply_to: repid)
        pst.save!
        HashTag.register_hash_tags comment, pst.id
      end
    else
      Post.transaction do
        pst = Post.new(user_id: session[:user_id], comment: comment, quote: -1)
        pst.save!
        HashTag.register_hash_tags comment, pst.id
        Chart.save_chart(data, option, chart_id, pst, session[:user_id])
      end
    end
    
    return {success: true}.to_json
    
  rescue ActiveRecord::RecordInvalid => e
    return {success: false, error_msg: e.record.errors.messages}.to_json
  end
  
end

def format_user_link(comment)
  comment.gsub(/(@(\w+)) /, '<a href="/user/\\2">\\1</a>')
end

def to_screen(attr)
  case attr
  when :name
    'User Name'
  when :email
    'E-mail'
  when :password
    'Password'
  when :series_label
    'Series Label'
  when :general
    ''
  end
end
