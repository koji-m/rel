require 'active_record'

class Series < ActiveRecord::Base
  belongs_to :chart
end
