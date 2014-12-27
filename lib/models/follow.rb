require 'active_record'

class Follow < ActiveRecord::Base
  belongs_to :user
  belongs_to :user, :foreign_key => :followee
end
