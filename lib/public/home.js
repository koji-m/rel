$(function(){
  var chartEditor = $('#chart_editor');

  initTimeLine('#main_contents');
  
  $('#send_btn').click(function(event){
    event.preventDefault();
    var cmnt = $('#comment_txt').val();
    
    sendData(cmnt, chartEditor, $('#post_panel'), '#proc_status', '#proc_result');
  });

  $('.start-edit-btn').live('click', function(){
    if(this.id == 'new_post'){
      var cplot = $.jqplot('chart_editor', newChartSeries, newChartOptions);
      makeDataSync(cplot);
      chartEditor.data('plot', cplot);

      $('#post_panel').one('shown.bs.modal', function(e){
        chartEditor.data('plot').replot();
        chartEditor.data('newFlag', true)
        setChartController(cplot, true);
      });
    }else{
      var target = $(this).parent().siblings('.jqplot-target');
      var targetPlot = target.data('plot');
      var csv = targetPlot.options.csv;

      chartEditor.data('edit-button', $(this));
      chartEditor.data('chart-id', target.data('chart-id'));

      if(!csv){
        //get filterValue from specified chart_id
        var filterValue = filterValueFor(targetPlot);

        //start getting dragable filter
        $xhr = $.getScript('/script/' + filterValue);
        $xhr.done(function(script){
          setMouseMoveFilter(dragableFilter);
          setMouseDownFilter(dragableFilter);
          setRemovePointFilter(dragableFilter);
        });
      }
      
      //set shown.bs.modal event listener
      $('#post_panel').one('shown.bs.modal', function(e){
        var optionCopy = $.extend(true, {}, targetPlot.options);
        var originalData = $.extend(true, [], targetPlot.data);
        chartEditor.data('original-data', originalData);

        if(!csv){
          for( var i = 0, l = originalData.length; i < l; i++){
            $.extend(true, optionCopy.series[i], dragableSettings);
          }
        }

        var cplot = $.jqplot('chart_editor', originalData, optionCopy);
        chartEditor.data('plot', cplot);

        if(csv){
          var dg = $('#dataGrid');
          loadDataGrid(cplot, dg, editableFilter(cplot.data));
          
          chartEditor.data('dataGrid', dg.handsontable('getInstance'));
          
          setChartControllerForDG(cplot);
        }else{
          setChartController(cplot);
          
          $('#file_selector').addClass('hidden');
        }
      });
    }

    

    //modal open
    $('#post_panel').modal();
    
  });

  
  $('#autoscale_btn').click(fireToggleScaleMode);
  $('#series_generator').live('click', addSeries);
  $('.add-point-btn').live('click', fireAddPoint);
  $('.rm-point-btn').live('click', fireRemovePoint);

  $('.quote-btn').live('click', fireQuoteModal);
  $('#quote_send_btn').click(function(event){
    event.preventDefault();

    var quoteId = $('#quote_panel').data('quoteId');
    var userName = $('#quote_panel .modal-body .user_name').text();
    var cmnt = $('#quote_panel .modal-body .comment').text();
    cmnt = 'QT @' + userName + ' ' + cmnt;

    sendData(cmnt, $('#quotePlot'), $('#quote_panel'), '#qtProcStatus', '#qtProcResult',
             quoteId);
  });

  $('.reply-btn').live('click', fireReplyModal);
  $('#reply_send_btn').click(function(event){
    event.preventDefault();

    var cmnt = $('#reply_comment').val();
    var replyId = $('#reply_panel').data('postId');

    sendData(cmnt, $('#replyPlot'), $('#reply_panel'), '#rpProcStatus', '#rpProcResult',
             undefined, replyId);
  });

});
