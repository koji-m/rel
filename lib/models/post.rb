require 'active_record'

class Post < ActiveRecord::Base
  has_many :hash_tags
  belongs_to :user
  belongs_to :chart

  validates :comment,
  length: {maximum: 140}
  
  # Returns posts of my own and my followee.
  # Note1: For use of UNION operator, raw SQL is embedded.
  #       But abstract degree is high enough, so that it would not be a problem.
  # Note2: This method returns only post records, so that SELECT query is executed per post afterward.
  #        It should be compared with INNER JOIN pattern anyway.
  def self.find_associative_posts(user_id, from, to, limit, order)
    if from
      return {} unless (Float(from) rescue nil)
    end

    if to
      return {} unless (Float(to) rescue nil)
    end

    if limit
      return {} unless (Integer(limit) rescue nil)
    end

    if order
      return {} unless (order == 'asc' || order == 'desc')
    end

    
    time_condition = build_time_condition(from, to, :updated_at)
    followee_ids = Follow.select(:followee).where(user_id: user_id)

    d = Post.find_by_sql(Post.where(user_id: followee_ids).where(time_condition).to_sql + \
                        ' UNION ' + \
                        Post.where('user_id = ? AND quote < 0', user_id)\
                        .where(time_condition).to_sql + \
                        (order ? ' ORDER BY updated_at ' + order : ' ') + \
                        (limit ? ' LIMIT ' + limit : ''))

    rp = d.map do |pst|
      Post.where(id: pst.reply_to).first
    end
    
    t = (Time.now.to_f * 1000.0).floor
    
    {data: d, reply_of: rp, time_stamp: t}
  end

  
  def self.search_by_hashtag(query, limit, order, from, to, option)
    # option is not used for now.

    if limit
      return {} unless (limit = Integer(limit) rescue nil)
    end

    if order
      return {} unless (order == 'asc' || order == 'desc')
    else
      order = 'asc'
    end

    if from
      return {} unless (from = Float(from) rescue nil)
    end

    if to
      return {} unless (to = Float(to) rescue nil)
    end

    time_condition = build_time_condition(from, to, :updated_at)
    
    if query[0] != '#'
      query = '#' + query
    end

    d = Post.where(id: HashTag.select(:post_id).where(tag: query))\
            .where(time_condition).order(updated_at: order.to_sym).limit(limit)

    rp = d.map do |pst|
      Post.where(id: pst.reply_to).first
    end
    
    t = (Time.now.to_f * 1000.0).floor
    
    {data: d, reply_of: rp, time_stamp: t}
  end
  
  
  def self.user_specific_posts(user_name, from, to, limit, order)
    if from
      return {} unless (Float(from) rescue nil)
    end

    if to
      return {} unless (Float(to) rescue nil)
    end

    if limit
      return {} unless (Integer(limit) rescue nil)
    end

    if order
      return {} unless (order == 'asc' || order == 'desc')
    end

    
    time_condition = build_time_condition(from, to, :updated_at)

    user_id = User.where(name: user_name).first.id
    name_cond = '@' + user_name + ' %'
    
    d = Post.find_by_sql(Post.where('comment LIKE ?', name_cond)\
                           .where(time_condition).to_sql + \
                         ' UNION ' + \
                         Post.where('user_id = ? AND quote < 0', user_id)\
                           .where(time_condition).to_sql + \
                         (order ? ' ORDER BY updated_at ' + order : ' ') + \
                         (limit ? ' LIMIT ' + limit : ''))

    rp = d.map do |pst|
      Post.where(id: pst.reply_to).first
    end
    
    t = (Time.now.to_f * 1000.0).floor
    
    {data: d, reply_of: rp, time_stamp: t}
  end

  
  def self.build_time_condition(from, to, attr)
    if from
      if to
        {attr => Time.at(Float(from) / 1000.0)..Time.at(Float(to) / 1000.0) }
      else
        [attr.to_s + ' > ?', Time.at(Float(from) / 1000.0)]
      end
    else
      if to
        [attr.to_s + ' < ?', Time.at(Float(to) / 1000.0)]
      else
        ''
      end
    end
  end
end
