require 'active_record'

class HashTag < ActiveRecord::Base
  belongs_to :post

  def self.register_hash_tags(comment, post_id)
    htags = comment.scan(/(#\w+)(?:\s|\Z)/)
    
    htags.each do |htag|
      ht = self.new(post_id: post_id, tag: htag[0])
      ht.save!
    end
  end
end
