# coding: utf-8
require 'active_record'

class Chart < ActiveRecord::Base
  has_many :posts
  has_many :series

  validates :title,
  length: {maximum: 20}

  validates :xlabel,
  length: {maximum: 20}

  validates :ylabel,
  length: {maximum: 20}

  validates :option,
  plot_option: true
  
  # Convert line chart data to formated data for client.
  # data: [<post_data #0>, <post_data #1>, ...]
  # post_data: [<post_id>, <series_data>]
  # post_id: <integer>
  # series_data: [<series #0>, <series #1>, ...]
  # series: [[<x #0>, <y #0>], [<x #1>, <y #1>], ...]
  # x | y: <number>
  def self.format_line_chart(chrt, post_id)
    return nil unless pst_id = (Integer(post_id) rescue nil)
    data = chrt[:data]
    ser = []
    cmnt = []
    
    data.each do |post_data|
      break if post_data[0] > pst_id
      pst = Post.find_by_id(post_data[0])
      series_data = post_data[1]

      series_data.each_index do |i|
        if series_data[i].any?
          if ser[i]
            ser[i] += series_data[i]
            if pst.comment
              cmnt[i][ser[i].length - 1] = pst.comment
            else
              cmnt[i][ser[i].length - 1] = pst.updated_at
            end
          else
            ser[i] = series_data[i]
            if pst.comment
              cmnt[i] = {ser[i].length - 1 => pst.comment}
            else
              cmnt[i] = {ser[i].length - 1 => pst.updated_at}
            end
          end
        end
      end
    end

    {series: ser, comments: cmnt, options: chrt[:option]}
  end

  # Fetch unmarshaled chart data with option from DB.
  def self.fetch(chrt_id)
    return nil unless c_id = (Integer(chrt_id) rescue nil)
    return nil unless chrt = self.find_by_id(c_id)
    
    {data: Marshal.load(chrt.data), option: Marshal.load(chrt.option)}
  end

  # Save chart data with specified chart id(chrt_id) and post id(pst_id).
  # data: JSON String (incremental difference data if updating chart)
  # opts: JSON String
  # chrt_id: Integer (nil if make post with new chart)
  # pst_id: Integer
  def self.save_chart(data, opts, chrt_id, pst, usr_id)
    opts_data = JSON.parse(opts)

    # set dragable off
    opts_series = opts_data['series']
    opts_series.each {|opt| opt['isDragable'] = false }

    chrt_data = [pst.id, JSON.parse(data)]

    Chart.transaction do
      if chrt_id
        chrt_id = chrt_id.to_i
        # edit chart specified by chrt_id if editable
        if self.editable?(chrt_id, usr_id)
          if chrt = Chart.find_by_id(chrt_id)
            chrt.data_append chrt_data
            chrt.option = Marshal.dump(opts_data)
            chrt.save!
          else
            raise 'Chart not found'
          end
        else
          raise 'Permission denied'
        end
      else
        # create new chart
        chrt = Chart.new(data: Marshal.dump([chrt_data]), option: Marshal.dump(opts_data))
        chrt.title = opts_data['title']['text'].nil? ? '' : opts_data['title']['text']
        chrt.xlabel = opts_data['axes']['xaxis']['label'].nil? ? '' : opts_data['axes']['xaxis']['label']
        chrt.ylabel = opts_data['axes']['yaxis']['label'].nil? ? '' : opts_data['axes']['yaxis']['label']
        chrt.save!
      end

      pst.chart = chrt
      pst.save!
    end
  end

  def self.save_quoted_chart(pst, quote_id)
    org_post = Post.find(quote_id)
    org_chart = org_post.chart
    chart_data = Marshal.load(org_chart.data)

    new_chart = []
    
    chart_data.each do |d|
      break if d[0] > quote_id
      new_chart << d
    end
    
    Chart.transaction do
      chrt = Chart.new(data: Marshal.dump(new_chart), option: org_chart.option)
      opts_data = Marshal.load(org_chart.option)
      chrt.title = opts_data['title']['text'].nil? ? '' : opts_data['title']['text']
        chrt.xlabel = opts_data['axes']['xaxis']['label'].nil? ? '' : opts_data['axes']['xaxis']['label']
        chrt.ylabel = opts_data['axes']['yaxis']['label'].nil? ? '' : opts_data['axes']['yaxis']['label']
      chrt.save!

      pst.chart = chrt
      pst.save!
    end
  end
  
  # Append chart data associated with a post.
  # chrt_data: Array [<post_id>, <series_data>]
  def data_append(chrt_data)
    ums_data = Marshal.load(self.data)
    ums_data << chrt_data
    self.data = Marshal.dump(ums_data)
  end

  # Editable only if the user is owner of the chart
  def self.editable?(chrt_id, usr_id)
    if pst = Post.where(chart_id: chrt_id).first
      pst.user.id == usr_id
    else
      # no such post for chart id
      false
    end
  end
  
end

