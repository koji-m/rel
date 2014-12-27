# coding: utf-8

module Rel
  class ChartController < ApplicationController

    # Specified chart data by JSON format
    get '/:chart_id' do
      content_type :json

      chrt_id = params[:chart_id]
      pst_id = params[:post_id]
      if params[:edit] && !(authenticate && Chart.editable?(chrt_id, session[:user_id]))
        return nil
      end
      return nil unless chrt = Chart.fetch(chrt_id)
      chrt = Chart.format_line_chart(chrt, pst_id)
      chrt.to_json
    end
    
  end
end


