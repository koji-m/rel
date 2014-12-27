# coding: utf-8

require 'mimemagic'

class ImageUrlValidator < ActiveModel::EachValidator
  IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']
  
  def validate_each(record, attribute, value)
    mime = MimeMagic.by_path(value)

    if mime
      if IMAGE_TYPES.include? mime.type
        true
      else
        record.errors.add(attribute, 'invalid image file URL.')
        false
      end
    else
      record.errors.add(attribute, 'invalid image file URL.')
      false
    end
  end
end
