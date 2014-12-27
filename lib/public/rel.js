var INC_VAL = 5;
var AXE_MIN = -10;
var AXE_MAX = 100;
var MAX_PANELS = 30;

var autoScale = false;

var dragableSettings = {dragable: {color: 'red', constrainTo: 'y'},
                        isDragable: true};


var newChartSeries = [[[0,0]]];
var newChartOptions = {
  series: [dragableSettings],
  seriesDefaults: {
    shadow: false,
    markerOptions: {
      shadow: false
    }
  },
  seriesColors: [
    '#fc440f', '#1effbc', '#7c9299', '#1f01b9', '#b4e33d'
  ],
  grid: {
    shadow: false,
    background: '#f5f5f5'
  },
  highlighter: {
    show: true,
    showMarker: true,
    useAxesFormatters: false
  },
  legend: {
    show: true,
    rendererOptions: {
      escapeHtml: true
    }
  },
  title: {
    text: 'plot-title',
    escapeHtml: true
  },
  axes: {
    xaxis: {
      label: 'x-axis',
      labelOptions: {
        escapeHTML: true
      }
    },
    yaxis: {
      label: 'y-axis',
      labelOptions: {
        escapeHTML: true
      }
    }
  },
  axesDefaults: {
    autoscale: false,
    min: AXE_MIN,
    max: AXE_MAX,
    tickOptions: {
      showMark: false,
      showGridline: false
    }
  }
};

var fileLoadedOptions = {
  highlighter: {
    show: true,
    showMarker: true,
    useAxesFormatters: false
  },
  legend: {
    show: true,
    rendererOptions: {
      escapeHtml: true
    }
  },
  title: {
    text: 'plot-title',
    escapeHtml: true
  },
  axes: {
    xaxis: {
      label: 'x-axis',
      labelOptions: {
        escapeHTML: true
      }
    },
    yaxis: {
      label: 'y-axis',
      labelOptions: {
        escapeHTML: true
      }
    }
  },
  axesDefaults: {
    autoscale: true
  }
};

var POST_GROUP_FORMAT = '<div class="panel panel-default"><ul class="list-group"></ul></div>';

var POST_LI_FORMAT = '<li class="list-group-item"></li>';

var PANEL_BODY_FORMAT = '<div class="panel-body"></div>';

var POST_FORMAT = '<div class="post"><div class="reply_to"></div><div class="quote_by"></div><span class="user_name"></span> <small><span class="post_time"></span></small><p><div class="comment"></div><div class="plot" style="width:600px;height:300px;"></div></p><span class="edit_button"></span><span class="quote-button"></span><span class="reply-button"></span></div>';

var REPLY_OF_FORMAT = '<div class="post"><div class="quote_by"></div><span class="user_name"></span> <small><span class="post_time"></span></small><p><div class="comment"></div><div class="plot" style="width:600px;height:300px;"></div></p><span class="edit_button"></span><span class="quote-button"></span><span class="reply-button"></span></div>';

var REPLY_TO_FORMAT = '<span class="glyphicon glyphicon-share-alt" aria-hidden="true"></span>'

var QUOTE_FROM_FORMAT = '<span class="glyphicon glyphicon-retweet" aria-hidden="true"></span>'

var NUM_OF_POST = 20;

var DEFAULT_TL = '#home_tl';

var REPLY_STRING = ' Reply to ';
var QUOTE_STRING = ' Quote by ';

$.minicolors.defaults.theme = 'bootstrap';


function escapeHTML(html){
  return $('<div>').text(html).html();
}

function initTimeLine(tlDomId, userName, query){
  var tl = $(tlDomId);
  var stream = tl.find('#tl_stream');
  var $xhr;
  if(userName){
    $xhr = getUserSpecificPosts(NUM_OF_POST, userName);
  }else if(query){
    $xhr = getSearchResults(NUM_OF_POST, query);
  }else{
    $xhr = getUpToDatePosts(NUM_OF_POST);
  }

  $xhr.done(function(data){
    var postData = data.post_data;
    var psts = postData.posts
    var replyOf = postData.reply_of
    
    $('#time_stamp').data('time-stamp', data.time_stamp);
    
    for(var i = 0, l = psts.length; i < l; i++){
      var pst = psts[i];
      if(!pst){ continue; }
      var rpl = replyOf[i];

      var idValPostId = 'post_' + pst.id;
      var idValChartId = 'chart_' + pst.chart_id;
      var quoteFrom = '';
      var quoteIcon = '';
      var quoteString = '';
      var postId = pst.id;
      var userName = pst.user_name;
      var updatedAt = pst.updated_at;
      
      if(pst.quote){
        quoteIcon = $(QUOTE_FROM_FORMAT);
        quoteFrom =  buildUserNameLink(pst.user_name);
        quoteString = QUOTE_STRING;
        postId = pst.quote.quote_id;
        userName = pst.quote.name;
        updatedAt = pst.quote.updated_at;
      }

      var $pst = $(POST_FORMAT)
          .find('.quote_by').append(quoteIcon, quoteString, quoteFrom).end()
          .find('.user_name').append(buildUserNameLink(userName)).end()
          .find('.post_time').text((new Date(Number(updatedAt))).toString()).end()
          .find('.comment').html(formatUserLink(pst.comment)).end()
          .find('.edit_button').append($(pst.edit_button)).end()
          .find('.quote-button').append($(pst.quote_button)).end()
          .find('.reply-button').append($(pst.reply_button)).end();

      $pst.data('updated-at', updatedAt);
      
      if(pst.chart_id){
        $pst.find('.plot').attr('id', idValChartId);
      }else{
        $pst.find('.plot').remove().end()
            .find('.edit_button').remove();
      }
      
      $pst.attr('id', idValPostId);
      
      var $rplOf = null;
      if(rpl){
        var rplIdValPostId = 'post_' + rpl.id;
        var rplIdValChartId = 'chart_' + rpl.chart_id;
        var rplQuoteFrom = '';
        var rplQuoteIcon = '';
        var rplQuoteString = '';
        var rplPostId = rpl.id;
        var rplUserName = rpl.user_name;
        var rplUpdatedAt = rpl.updated_at;
        
        if(rpl.quote){
          rplQuoteIcon = $(QUOTE_FROM_FORMAT);
          rplQuoteFrom = buildUserNameLink(rpl.user_name);
          rplQuoteString = QUOTE_STRING;
          rplPostId = rpl.quote.quote_id;
          rplUserName = rpl.quote.name;
          rplUpdatedAt = rpl.quote.updated_at;
        }

        $pst.find('.reply_to').append($(REPLY_TO_FORMAT),
                              REPLY_STRING,
                              buildUserNameLink(rplUserName));
        $pst.find('.reply-button').remove();
        
        $rplOf = $(REPLY_OF_FORMAT)
          .find('.quote_by').append(rplQuoteIcon, rplQuoteString, rplQuoteFrom).end()
          .find('.user_name').append(buildUserNameLink(rplUserName)).end()
          .find('.post_time').text((new Date(Number(rplUpdatedAt))).toString()).end()
          .find('.comment').html(formatUserLink(rpl.comment)).end()
          .find('.edit_button').append($(rpl.edit_button)).end()
          .find('.quote-button').append($(rpl.quote_button)).end()
          .find('.reply-button').append($(rpl.reply_button)).end();

        $rplOf.attr('id', rplIdValPostId);
        
        if(rpl.chart_id){
          $rplOf.find('.plot').attr('id', rplIdValChartId);
          embedChartData(rpl.id, rpl.chart_id, rplIdValPostId + ' #' + rplIdValChartId);
        }else{
          $rplOf.find('.plot').remove().end()
                .find('.edit_button').remove();
        }
      }

      var $pstGrp = $(POST_GROUP_FORMAT);
      var $pstLi = $(POST_LI_FORMAT).append($pst);
      $pstGrp.find('.list-group').append($pstLi);
      

      if($rplOf){
        var $pbody = $(PANEL_BODY_FORMAT).append($rplOf);
        $pstGrp.append($pbody);
      }

      stream.append($pstGrp);
      
      if(pst.chart_id){
        embedChartData(postId, pst.chart_id, idValPostId + ' #' + idValChartId);
      }
    }

    regulatePosts(stream);

    var panels = stream.find('.panel');
    var lastPost =$($(panels[panels.length-1]).find('.list-group-item .post')[0]);
    $('#tail_time_stamp').data('time-stamp', lastPost.data('updated-at'));

    tooltipInit();
    
  }).fail(function(psts){
    // some error processing here
  });
}

function getMore(tlDomId, userName, query){
  var tl = $(tlDomId);
  var stream = tl.find('#tl_stream');
  var timeStamp = Number(tl.find('#tail_time_stamp').data('time-stamp'));
  var $xhr;
  if(userName){
    $xhr = getMoreUserSpecificPosts(NUM_OF_POST, userName, timeStamp);
  }else if(query){
    $xhr = getMoreSearchResults(NUM_OF_POST, query, timeStamp);
  }else{
    $xhr = getMorePosts(NUM_OF_POST, timeStamp);
  }

  $xhr.done(function(data){
    var postData = data.post_data;
    var psts = postData.posts
    var replyOf = postData.reply_of
    
    for(var i = 0, l = psts.length; i < l; i++){
      var pst = psts[i];
      if(!pst){ continue; }
      var rpl = replyOf[i];

      var idValPostId = 'post_' + pst.id;
      var idValChartId = 'chart_' + pst.chart_id;
      var quoteFrom = '';
      var quoteIcon = '';
      var quoteString = '';
      var postId = pst.id;
      var userName = pst.user_name;
      var updatedAt = pst.updated_at;
      
      if(pst.quote){
        quoteIcon = $(QUOTE_FROM_FORMAT);
        quoteFrom =  buildUserNameLink(pst.user_name);
        quoteString = QUOTE_STRING;
        postId = pst.quote.quote_id;
        userName = pst.quote.name;
        updatedAt = pst.quote.updated_at;
      }

      var $pst = $(POST_FORMAT)
          .find('.quote_by').append(quoteIcon, quoteString, quoteFrom).end()
          .find('.user_name').append(buildUserNameLink(userName)).end()
          .find('.post_time').text((new Date(Number(updatedAt))).toString()).end()
          .find('.comment').html(formatUserLink(pst.comment)).end()
          .find('.edit_button').append($(pst.edit_button)).end()
          .find('.quote-button').append($(pst.quote_button)).end()
          .find('.reply-button').append($(pst.reply_button)).end();

      $pst.data('updated-at', updatedAt);
      
      if(pst.chart_id){
        $pst.find('.plot').attr('id', idValChartId);
      }else{
        $pst.find('.plot').remove().end()
            .find('.edit_button').remove();
      }
      
      $pst.attr('id', idValPostId);
      
      var $rplOf = null;
      if(rpl){
        var rplIdValPostId = 'post_' + rpl.id;
        var rplIdValChartId = 'chart_' + rpl.chart_id;
        var rplQuoteFrom = '';
        var rplQuoteIcon = '';
        var rplQuoteString = '';
        var rplPostId = rpl.id;
        var rplUserName = rpl.user_name;
        var rplUpdatedAt = rpl.updated_at;
        
        if(rpl.quote){
          rplQuoteIcon = $(QUOTE_FROM_FORMAT);
          rplQuoteFrom = buildUserNameLink(rpl.user_name);
          rplQuoteString = QUOTE_STRING;
          rplPostId = rpl.quote.quote_id;
          rplUserName = rpl.quote.name;
          rplUpdatedAt = rpl.quote.updated_at;
        }

        $pst.find('.reply_to').append($(REPLY_TO_FORMAT),
                              REPLY_STRING,
                              buildUserNameLink(rplUserName));
        $pst.find('.reply-button').remove();
        
        $rplOf = $(REPLY_OF_FORMAT)
          .find('.quote_by').append(rplQuoteIcon, rplQuoteString, rplQuoteFrom).end()
          .find('.user_name').append(buildUserNameLink(rplUserName)).end()
          .find('.post_time').text((new Date(Number(rplUpdatedAt))).toString()).end()
          .find('.comment').html(formatUserLink(rpl.comment)).end()
          .find('.edit_button').append($(rpl.edit_button)).end()
          .find('.quote-button').append($(rpl.quote_button)).end()
          .find('.reply-button').append($(rpl.reply_button)).end();

        $rplOf.attr('id', rplIdValPostId);
        
        if(rpl.chart_id){
          $rplOf.find('.plot').attr('id', rplIdValChartId);
          embedChartData(rpl.id, rpl.chart_id, rplIdValPostId + ' #' + rplIdValChartId);
        }else{
          $rplOf.find('.plot').remove().end()
                .find('.edit_button').remove();
        }
      }

      var $pstGrp = $(POST_GROUP_FORMAT);
      var $pstLi = $(POST_LI_FORMAT).append($pst);
      $pstGrp.find('.list-group').append($pstLi);
      

      if($rplOf){
        var $pbody = $(PANEL_BODY_FORMAT).append($rplOf);
        $pstGrp.append($pbody);
      }

      stream.append($pstGrp);
      
      if(pst.chart_id){
        embedChartData(postId, pst.chart_id, idValPostId + ' #' + idValChartId);
      }
    }

    regulatePosts(stream);

    var panels = stream.find('.panel');
    var totalPanels = panels.length;
    var overFlow =  totalPanels - MAX_PANELS;
    if(overFlow > 0){
      for(var i = 0, l = overFlow; i < l; i++){
        $(panels[i]).remove();
      }
    }
    panels = stream.find('.panel');
    var topPost = $($(panels[0]).find('.list-group .post')[0]);
    $('#time_stamp').data('time-stamp', topPost.data('updated-at'));
    var lastPost =$($(panels[panels.length-1]).find('.list-group-item .post')[0]);
    $('#tail_time_stamp').data('time-stamp', lastPost.data('updated-at'));

    tooltipInit();
    
  }).fail(function(psts){
    // some error processing here
  });
}

function getUpToDatePosts(numPosts){
  return $.getJSON('/post', {num: numPosts, order: 'desc'});
}  

function getUserSpecificPosts(numPosts, userName){
  return $.getJSON('/user/' + userName + '/post', {num: numPosts, order: 'desc'});
}

function getSearchResults(numPosts, query){
  return $.getJSON('/query', {num: numPosts, q: query, order:'desc'});
}

function getMorePosts(numPosts, timeStamp){
  return $.getJSON('/post', {num: numPosts, order: 'desc', to: timeStamp});
}  

function getMoreUserSpecificPosts(numPosts, userName, timeStamp){
  return $.getJSON('/user/' + userName + '/post',
                   {num: numPosts, order: 'desc', to: timeStamp});
}

function getMoreSearchResults(numPosts, query, timeStamp){
  return $.getJSON('/query',
                   {num: numPosts, q: query, order:'desc', to: timeStamp});
}

function getIncDiffSearchResults(timeStamp, query){
  return $.getJSON('/query', {q: query, order: 'desc', from: timeStamp});
}

function getNewlyArrivedPosts(timeStamp){
  return $.getJSON('/post', {from: timeStamp});
}

function getUserSpecificNewPosts(timeStamp, userName){
  return $.getJSON('/user/' + userName + '/post', {from: timeStamp});
}

function embedChartData(postId, chartId, target){
  var $xhr = getChartData(postId, chartId);

  $xhr.done(function(chrt){
    if(chrt){
      if($('#' + target).length != 0){
        var plot = buildPlot(target, chrt['series'], chrt['options'], chrt['comments']);
        $('#' + target).data('plot', plot);
        $('#' + target).data('chart-id', chartId);
      }
    }else{
      // no chart error here
    }
  }).fail(function(chrt){
    // some error processing here
  });
}

function getChartData(postId, chartId){
  return $.getJSON('/chart/' + chartId, {post_id: postId});
}

function buildPlot(target, ser, opt, cmnt){

  opt.highlighter.tooltipContentEditor = function(str, serIdx, ptIdx){
    if(cmnt[serIdx]){
      if(cmnt[serIdx][ptIdx]){
        return escapeHTML(cmnt[serIdx][ptIdx]);
      }
    }
    return str;
  };

  //** here target must be specified by data-post-id=XXX -> id=chart_XXX
  return $.jqplot(target, ser, opt);
}

// Get chart data from server.
// Returns null, if argument(chrt_id) is null or server returns false state.
// Otherwise returns object like...
// {series: <series data>, comments: <comment data>, options: <option data>}
function getChartDataForEdit(chrt_id){
  if(chrt_id){
    // GET /chart/:chart_id?edit=true
    return $.getJSON('/chart/' + chrt_id, {edit: true});
  }else{
    return null;
  }
}

function sendData(comment, chartEditor, $modal, statusDomId, resultDomId, quoteId,
                  replyId, userName, queryWord)
{
  var seriesData, options, chartId ;

  if(typeof quoteId === 'undefined' && typeof replyId === 'undefined'){
    chartId = chartEditor.data('chart-id');
    var editButton = chartEditor.data('edit-button');
    var plot = chartEditor.data('plot');
    
    seriesData = collectSeriesData(plot.series);
    var originalData = chartEditor.data('original-data');

    if(originalData){
      seriesData = getIncDiff(seriesData, originalData);
    }

    seriesData = JSON.stringify(seriesData);
    
    options = JSON.stringify(plot.options);
  }
  
  $.ajax({url: '/post',
          type: 'POST',
          data: {data: seriesData, option: options, chrt_id: chartId, comment: comment,
                 quote_id: quoteId, reply_id: replyId},
          dataType: 'json',
          beforeSend: function(xhr){
            $(statusDomId).text('Sending..');
          },
          success: function(data,textStatus, xhr){
            if(data.success){
              //beforeRefreshTL(replyId);
              refreshTimeLine('#main_contents', userName, queryWord);
              if(editButton){ editButton.remove(); }
              $modal.modal('hide');
            }else{
              printError(data.error_msg, resultDomId);
            }
          },
          error: function(xhr, textStatus, errorThrown){
            $(resultDomId).text('Error: ' + errorThrown);
          },
          complete: function(xhr, textStatus){
            $(statusDomId).text('');
          }});
}

function refreshTimeLine(tlDomId, userName, query){
  if(tlDomId){
    var tl = $(tlDomId);

    var ts = Number(tl.find('#time_stamp').data('time-stamp'));
    
    if(!ts){ return false }

    var stream = tl.find('#tl_stream');

    var $xhr;

    if(userName){
      $xhr = getUserSpecificNewPosts(ts, userName);
    }else if(query){
      $xhr = getIncDiffSearchResults(ts, query);
    }else{
      $xhr = getNewlyArrivedPosts(ts);
    }
    
    $xhr.done(function(data){
      var postData = data.post_data;
      var psts = postData.posts;
      var replyOf = postData.reply_of;

      $('#time_stamp').data('time-stamp', data.time_stamp);
      
      for(var i = 0, l = psts.length; i < l; i++){
        var pst = psts[i];
        if(!pst){ continue; }
        var rpl = replyOf[i];
        
        var idValPostId = 'post_' + pst.id;
        var idValChartId = 'chart_' + pst.chart_id;
        var quoteFrom = '';
        var quoteIcon = '';
        var quoteString = '';
        var postId = pst.id;
        var userName = pst.user_name;
        var updatedAt = pst.updated_at;
        
        if(pst.quote){
          quoteIcon = $(QUOTE_FROM_FORMAT);
          quoteFrom = buildUserNameLink(pst.user_name);
          quoteString = QUOTE_STRING;
          postId = pst.quote.quote_id;
          userName = pst.quote.name;
          updatedAt = pst.quote.updated_at;
        }

        var $pst = $(POST_FORMAT)
            .find('.quote_by').append(quoteIcon, quoteString, quoteFrom).end()
            .find('.user_name').append(buildUserNameLink(userName)).end()
            .find('.post_time').text((new Date(Number(updatedAt))).toString()).end()
            .find('.comment').html(formatUserLink(pst.comment)).end()
            .find('.plot').attr('id', idValChartId).end()
            .find('.edit_button').append($(pst.edit_button)).end()
            .find('.quote-button').append($(pst.quote_button)).end()
            .find('.reply-button').append($(pst.reply_button)).end();

        $pst.data('updated-at', updatedAt);

        if(pst.chart_id){
          $pst.find('.plot').attr('id', idValChartId);
        }else{
          $pst.find('.plot').remove().end()
              .find('.edit_button').remove();
        }
        
        $pst.attr('id', idValPostId);

        var $rplOf = null;
        if(rpl){
          var rplIdValPostId = 'post_' + rpl.id;
          var rplIdValChartId = 'chart_' + rpl.chart_id;
          var rplQuoteIcon = '';
          var rplQuoteFrom = '';
          var rplQuoteString = '';
          var rplPostId = rpl.id;
          var rplUserName = rpl.user_name;
          var rplUpdatedAt = rpl.updated_at;
          
          if(rpl.quote){
            rplQuoteIcon = $(QUOTE_FROM_FORMAT);
            rplQuoteFrom = buildUserNameLink(rpl.user_name);
            rplQuoteString = QUOTE_STRING;
            rplPostId = rpl.quote.quote_id;
            rplUserName = rpl.quote.name;
            rplUpdatedAt = rpl.quote.updated_at;
          }

          $pst.find('.reply_to').append($(REPLY_TO_FORMAT),
                                REPLY_STRING,
                                buildUserNameLink(rplUserName));

          $pst.find('.reply-button').remove();
          
          $rplOf = $(REPLY_OF_FORMAT)
              .find('.quote_by').append(rplQuoteIcon, rplQuoteString, rplQuoteFrom).end()
              .find('.user_name').append(buildUserNameLink(rplUserName)).end()
              .find('.post_time').text((new Date(Number(rplUpdatedAt))).toString()).end()
              .find('.comment').html(formatUserLink(rpl.comment)).end()
              .find('.plot').attr('id', rplIdValChartId).end()
              .find('.edit_button').append($(rpl.edit_button)).end()
              .find('.quote-button').append($(rpl.quote_button)).end()
              .find('.reply-button').append($(rpl.reply_button)).end();

          $rplOf.attr('id', rplIdValPostId);
          
          if(rpl.chart_id){
            $rplOf.find('.plot').attr('id', rplIdValChartId);
            embedChartData(rpl.id, rpl.chart_id, rplIdValPostId + ' #' + rplIdValChartId);
          }else{
            $rplOf.find('.plot').remove().end()
                  .find('.edit_button').remove();
          }
        }

        var $pstGrp = $(POST_GROUP_FORMAT);
        var $pstLi = $(POST_LI_FORMAT).append($pst);
        $pstGrp.find('.list-group').append($pstLi);
        

        if($rplOf){
          var $pbody = $(PANEL_BODY_FORMAT).append($rplOf);
          $pstGrp.append($pbody);
        }

        stream.prepend($pstGrp);

        if(pst.chart_id){
          embedChartData(postId, pst.chart_id, idValPostId + ' #' + idValChartId);
        }
      }

      regulatePosts(stream);

      var panels = stream.find('.panel');
      var totalPanels = panels.length;
      var overFlow =  totalPanels - MAX_PANELS;
      if(overFlow > 0){
        for(var i = totalPanels - 1, l = MAX_PANELS - 1; i > l; i--){
          $(panels[i]).remove();
        }
      }
      
      var lastPost =$($(panels[panels.length-1]).find('.list-group-item .post')[0]);
      $('#tail_time_stamp').data('time-stamp', lastPost.data('updated-at'));

      tooltipInit();

    });
  }
}

function collectSeriesData(series){
  var res = [];
  for(var i = 0; i < series.length; i++){
    res.push(series[i].data);
  }

  return res;
}

// data=[<series1>, <series2>, ...]
// series=[<point1>, <point2>, ...]
function getIncDiff(newData, oldData){
  var diff = [];
  
  for(var i = 0; i < newData.length; i++){
    diff.push([]);

    if(oldData[i]){
      for(var j = 0; j < newData[i].length; j++){
        if(!(oldData[i][j])){
          diff[i].push(newData[i][j]);
        }
      }
    }else{
      for(var j = 0; j < newData[i].length; j++){
        diff[i].push(newData[i][j]);
      }
    }
  }
  return diff;
}

function filterValueFor(plot){
  var res = '';
  var series = plot.data;

  for(var i = 0; i < series.length; i++){
    res += (i + '_' + series[i].length + '!');
  }

  return res.slice(0, -1);
}

function copyOption(opt){
  var copy = {seriesDefaults: {}, highlighter: {}, series: [], legend: {}};
  
  for(var k in opt.highlighter){ copy.highlighter[k] = opt.highlighter[k]; }
  for(var k in opt.legend){ copy.legend[k] = opt.legend[k]; }

  return copy;
}

function fireAddPoint(event){
  event.preventDefault();
  var seriesIdx = Number($(this).attr('data-series-id'));
  var chartEditor = $('#chart_editor');
  var cplot = chartEditor.data('plot');
  var addPointIdx = cplot.series[seriesIdx].data.length;
  var neighbor = {seriesIndex: seriesIdx, pointIndex: addPointIdx};

  cplot.eventCanvas._elem.trigger('evAddPoint', [null, null, neighbor, cplot]);
}
  
function addPoint(event, gridpos, datapos, neighbor, plot){
  var newAxesMax = addOnePointTo(plot, neighbor.seriesIndex);

  if(autoScale){
    plot.replot({resetAxes: true});
  }else{
    if(newAxesMax){
      // reInitialize
      plot.replot({axesDefaults: {min: AXE_MIN, max: newAxesMax}, resetAxes: false});
      makeDataSync(plot);
    }else{
      // quickInit (no need to invoke sync data)
      plot.replot({resetAxes: false});
    }
  }

}

function addOnePointTo(plot, idx){
  var seriesData = plot.series[idx].data;
  var currentLastPoint = seriesData[seriesData.length - 1];
  var newX = currentLastPoint[0] + INC_VAL;
  var newPoint = [newX, currentLastPoint[1]];

  plot.data[idx].push(newPoint);
  
  if(autoScale){ return; }
  
  var axesMax = plot.options.axesDefaults.max;
  if(plot.options.axesDefaults.max && newX < axesMax){
    return 0;
  }
  return axesMax + INC_VAL;
}

function fireRemovePoint(event){
  event.preventDefault();
  var seriesIdx = Number($(this).attr('data-series-id'));
  var chartEditor = $('#chart_editor');
  var cplot = chartEditor.data('plot');
  var rmPointIdx = cplot.series[seriesIdx].data.length - 1;
  var neighbor = {seriesIndex: seriesIdx, pointIndex: rmPointIdx};
  
  cplot.eventCanvas._elem.trigger('evRemovePoint', [null, null, neighbor, cplot]);
}

function removePoint(event, gridpos, datapos, neighbor, plot){
  var plotData = plot.data;
  var seriesIdx = neighbor.seriesIndex;
  var seriesData = plotData[seriesIdx];
  if(seriesData.length == 1){
    if(plotData.length == 1){
      return;
    }
    plotData.splice(seriesIdx, 1);
    plot.options.series.splice(seriesIdx, 1);

    var removed = plot.seriesColors.splice(seriesIdx, 1);
    plot.seriesColors.push(removed[0]);

    // reInitialize
    if(autoScale){
      plot.replot({data: plot.data, seriesColors: plot.seriesColors, resetAxes: true});
    }else{
      plot.replot({data: plot.data, seriesColors: plot.seriesColors, resetAxes: false});
    }

    makeDataSync(plot);

    $('.add-point-btn').remove();
    $('.rm-point-btn').remove();
    $('.color-picker').minicolors('destroy');
    $('.color-picker').remove();
    $('.label-editor').remove();
    $('#x_label').contents().remove();
    $('#y_label').contents().remove();
    $('#plot_title').contents().remove();
    
    var chartEditor = $('#chart_editor');
    setChartController(plot, chartEditor.data('newFlag'));

  }else{
    plot.data[neighbor.seriesIndex].pop();

    
    // quickInit (no need to invoke sync data)
    plot.replot({resetAxes: false});
  }

}

function setChartController(plot, newFlag, opts){
  var controller = generateChartController(plot);
  var addPointButtons = controller.addPointButton;
  var rmPointButtons = controller.rmPointButton;
  var colorPickers = controller.addColorPicker;
  var labelEditors = controller.addLabelEditor;

  for(var i = 0; i < addPointButtons.length; i++){
    var $seriesCtrl= $('<div class="series-controller"></div>');
    var $pointBtnGrp =$('<div class="btn-group point-btn-group" role="group"></div>');
    $pointBtnGrp.append(addPointButtons[i]);
    $pointBtnGrp.append(rmPointButtons[i]);
    $seriesCtrl.append($pointBtnGrp);
    $seriesCtrl.append(colorPickers[i]);
    $seriesCtrl.append(labelEditors[i]);
    $('#point_generators').append($seriesCtrl);
    
    makeColorPicker(colorPickers[i], i, plot);
    makeLabelEditor(labelEditors[i], i, plot);
  }

  var asBtn = $('#autoscale_btn');
  if(plot.options.axesDefaults.autoscale){
    autoScale = true;
    asBtn.attr('aria-pressed', 'true');
    asBtn.addClass('active');
  }else{
    autoScale = false;
    asBtn.attr('aria-pressed', 'false');
    asBtn.removeClass('active');
  }

  if(newFlag){
    if(opts){
      var title = opts.title;
      var xLabel = opts.xlabel;
      var yLabel = opts.ylabel;
    }else{
      var title = 'plot-title';
      var xLabel = 'x-axis';
      var yLabel = 'y-axis';
    }
    var titleEditor = $('<input id="title_editor" type="text" class="form-control" value="' + title  + '" placeholder="Title">');

    var xLabelEditor = $('<input class="axis-label-editor form-control" data-axis-for="xaxis" type="text" value="' + xLabel  + '" placeholder="X-Axis Label">');
    var yLabelEditor = $('<input class="axis-label-editor form-control" data-axis-for="yaxis" type="text" value="' + yLabel  + '" placeholder="Y-Axis Label">');
    $('#plot_title').append(titleEditor);
    $('#x_label').append(xLabelEditor);
    $('#y_label').append(yLabelEditor);
    makeTitleEditor(plot);
    makeAxisLabelEditor(plot);
  }
}

function resetControllerForDG(plot, newFlag){
  $('.color-picker').minicolors('destroy');
  $('.series-controller').remove();
  $('#x_label').contents().remove();
  $('#y_label').contents().remove();
  $('#plot_title').contents().remove();
  disableMouseDownFilter();
  disableRemovePointFilter();
  
  setChartControllerForDG(plot, newFlag, opts);
}

function setChartControllerForDG(plot, newFlag){
  var controller = generateChartControllerForDG(plot);
  var colorPickers = controller.colorPicker;

  for(var i = 0; i < colorPickers.length; i++){
    var $seriesCtrl= $('<div class="series-controller"></div>');
    $seriesCtrl.append(colorPickers[i]);
    $('#point_generators').append($seriesCtrl);

    makeColorPicker(colorPickers[i], i, plot);
  }

  $('#series_generator').addClass('hidden');
  $('#autoscale_btn').addClass('hidden');
  
  var asBtn = $('#autoscale_btn');
  if(plot.options.axesDefaults.autoscale){
    autoScale = true;
    asBtn.attr('aria-pressed', 'true');
    asBtn.addClass('active');
  }else{
    autoScale = false;
    asBtn.attr('aria-pressed', 'false');
    asBtn.removeClass('active');
  }

  if(newFlag){
    var titleEditor = $('<input id="title_editor" type="text" class="form-control" value="plot-title" placeholder="Title">');
    var xLabelEditor = $('<input class="axis-label-editor form-control" data-axis-for="xaxis" type="text" value="x-axis" placeholder="X-Axis Label">');
    var yLabelEditor = $('<input class="axis-label-editor form-control" data-axis-for="yaxis" type="text" value="y-axis" placeholder="Y-Axis Label">');
    $('#plot_title').append(titleEditor);
    $('#x_label').append(xLabelEditor);
    $('#y_label').append(yLabelEditor);
    makeTitleEditor(plot);
    makeAxisLabelEditor(plot);
  }
}

function generateChartController(plot){
  var addButtons = [];
  var rmButtons = [];
  var cpickers = [];
  var labels = [];

  for(var i = 0; i < plot.series.length; i++){
    var addBtn = $('<button class="add-point-btn btn btn-default btn-sm" type="button" data-series-id="' + i  + '"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></button>');
    var rmBtn = $('<button class="rm-point-btn btn btn-default btn-sm" type="button" data-series-id="' + i  + '"><span class="glyphicon glyphicon-minus" aria-hidden="true"></span></button>');
    var cp = $('<input type="hidden" class="color-picker">');
    var lbl = $('<input type="text" class="label-editor form-control input-sm" placeholder="Series Label">');
    addButtons.push(addBtn);
    rmButtons.push(rmBtn);
    cpickers.push(cp);
    labels.push(lbl);
  }

  return {addPointButton: addButtons, rmPointButton: rmButtons,
          addColorPicker: cpickers, addLabelEditor: labels};
}

function generateChartControllerForDG(plot){
  var cpickers = [];

  for(var i = 0; i < plot.series.length; i++){
    var cp = $('<input type="hidden" class="color-picker form-control">');
    cpickers.push(cp);
  }

  return {colorPicker: cpickers};
}

function makeColorPicker(colorPicker, idx, plot){
  colorPicker.minicolors({
    change: function(hex, opacity){
      var chartEditor = $('#chart_editor');
      plot.seriesColors[idx] = hex;

      // reInitialize
      plot.replot({seriesColors: plot.seriesColors});

      // after reInitialize, must sync data
      makeDataSync(plot);
    },
    defaults: {
      theme: 'bootstrap'
    }
  });

  colorPicker.minicolors('value', plot.seriesColors[idx % 5]);
}

function makeLabelEditor(labelEditor, idx, plot){
  labelEditor.on('blur change', function(){
    var txt = $(this).val();
    plot.series[idx].label = txt;
    plot.options.series[idx].label = txt;
    
    // quickInit (no need to invoke sync data)
    plot.replot({resetAxes: false});
  });

  var lbl = plot.series[idx].label;
  labelEditor.val(lbl);
  plot.options.series[idx].label = lbl;
}

function makeTitleEditor(plot){
  $('#title_editor').on('blur change', function(){
    var txt = $(this).val();
    var opts = {title: {text: txt}, resetAxes: false};
    
    // reInitialize
    plot.replot(opts);
    makeDataSync(plot);
  });
}
function makeAxisLabelEditor(plot){
  $('.axis-label-editor').on('blur change', function(){
    var axEditor =$(this);
    var txt = axEditor.val();
    var opts = {axes: {}, resetAxes: false};
    opts.axes[axEditor.attr('data-axis-for')] = {label: txt};
    
    // reInitialize
    plot.replot(opts);
    makeDataSync(plot);
  });
}

function addSeries(event){
  event.preventDefault();
  var newSeries = [[0,3]];  // init value must be modified
  var chartEditor = $('#chart_editor');
  var cplot = chartEditor.data('plot');
  
  cplot.data.push(newSeries);

  cplot.options.series.push(dragableSettings);

  // reInitialize
  if(autoScale){
    cplot.replot({data: cplot.data, resetAxes: true});
  }else{
    cplot.replot({data: cplot.data, resetAxes: false});
  }

  makeDataSync(cplot);

  $('.add-point-btn').remove();
  $('.rm-point-btn').remove();
  $('.color-picker').minicolors('destroy');
  $('.color-picker').remove();
  $('.label-editor').remove();
  var xlabel = $('#x_label').find('input').val();
  var ylabel = $('#y_label').find('input').val();
  var title = $('#plot_title').find('input').val();
  $('#x_label').contents().remove();
  $('#y_label').contents().remove();
  $('#plot_title').contents().remove();
  setChartController(cplot, chartEditor.data('newFlag'),
                     {title: title, xlabel: xlabel, ylabel: ylabel});

}

function makeDataSync(plot){
  plot.data = [];

  for(var i = 0, l = plot.series.length; i < l; i++){
    plot.data.push(plot.series[i].data);
  }
}

function fireToggleScaleMode(event){
  var cplot = $('#chart_editor').data('plot');

  cplot.eventCanvas._elem.trigger('evToggleScaleMode', [null, null, this, cplot]);
}

function toggleScaleMode(event, gridpos, datapos, tgButton, plot){
  var axesDefaults = plot.options.axesDefaults;
  if('false' == $(tgButton).attr('aria-pressed')){
    autoScale = true;
    axesDefaults.autoscale = true;
    delete axesDefaults.min;
    delete axesDefaults.max;
    // reInitialize
    plot.replot({resetAxes: true});
  }else{
    autoScale = false;
    var plotSeries = plot.series;
    var cmax = AXE_MIN;
    for(var i = 0, sl = plotSeries.length; i < sl; i++){
      for(var j = 0, dl = plotSeries[i].data.length; j < dl; j++){
        if(plotSeries[i].data[j][0] > cmax){
          cmax = plotSeries[i].data[j][0];
        }
      }
    }
    cmax = cmax < AXE_MAX ? AXE_MAX : cmax;

    axesDefaults.autoscale = false;
    
    // reInitialize
    plot.replot({axesDefaults: {min: AXE_MIN, max: cmax + INC_VAL}, resetAxes: false});
  }
  makeDataSync(plot);
}

Array.prototype.equals = function(array){
  if(!array || (this.length > array.length)){
    return false;
  }

  for(var i = 0, l = this.length; i < l; i++){
    if(this[i] instanceof Array && array[i] instanceof Array){
      if(!this[i].equals(array[i])){
        return false;
      }
    }else if(this[i] != array[i]){
      return false;
    }
  }
  return true;
}      


function csv2jqplot(str){
  var csv = str.trim();
  var plotData = [];
  var opt = {series: [], csv: true};
  var labels = [];
  var records = csv.split('\n');
  var xVals = [];
  var head = records[0].split(',');
  
  head.shift();
  
  for(var i = 0, l = head.length; i < l; i++){
    xVals.push(Number(head[i]));
  }
  
  records.shift();
  
  var numOfAttr = xVals.length;
  
  for(var i = 0, rl = records.length; i < rl; i++){
    var fields = records[i].split(',');
    opt.series[i] = {label: fields.shift()};
    if(fields.length != numOfAttr){ return null; }
    
    plotData.push([]);
    for(var j = 0, fl = fields.length; j < fl; j++){
      if(fields[j] == ""){ break; }  // Not support intermediate blank data for now.
      plotData[i].push([xVals[j], Number(fields[j])]);
    }
  }

  $.extend(true, opt, fileLoadedOptions);

  return {data: plotData, options: opt};
}


function plotModel(plot, numCol){
  var emptySet = [];
  for(var i = 0; i < numCol; i++){ emptySet.push([]); }
  
  var modelSchema = function(plot, idx){
    var _pub = {};
    var _plot = {};

    if(typeof plot === 'object'){
      _plot = plot;
    }

    if(idx == undefined){
      if(_plot.series){
        var maxIdx = 0;
        var max = 0;
        for(var i = 0, l = _plot.series.length; i < l; i++){
          if(_plot.series[i].data.length > max){
            max = _plot.series[i].data.length;
            maxIdx = i;
          }
        }
      }
      
      _pub.attr = function(attr, val){
        if(typeof val === 'undefined'){
          if(attr == 0){
            return "";
          }
          return _plot.series[maxIdx].data[attr-1][0];
        }

        if(attr > 0){
          for(var i = 0, l = _plot.series.length; i < l; i++){
            if(_plot.series[i].data[attr-1]){
              _plot.series[i].data[attr-1][0] = Number(val);
            }
          }
        }
        return _pub
      };  
    }else{
      _pub.attr = function(attr, val){
        if(typeof val === 'undefined'){
          if(attr == 0){
            return _plot.series[idx].label;
          }
          return _plot.series[idx].data[attr-1][1];
        }
        
        if(attr == 0){
          _plot.series[idx].label = val;
          _plot.options.series[idx].label = val;
        }else{
          _plot.series[idx].data[attr-1][1] = Number(val);
        }  
        return _pub;
      };
    }

    return _pub;
  };
  
  var data = [modelSchema(plot)];
  for(var i = 0, l = plot.series.length; i < l; i++){
    data.push(modelSchema(plot, i));
  }

  return {data: data, schema: modelSchema};
}

function colDataProps(numCol){
  var props = [];
  for(var i = 0; i < numCol; i++){
    props.push({data: property(i)});
  }
  return props;
}

function property(attr){
  return function(row, value){
    return row.attr(attr, value);
  }
}

function numOfColumn(plot){
  var max = 0;
  var series = plot.series;

  for(var i = 0, l = series.length; i < l; i++){
    if(max < series[i].data.length){
      max = series[i].data.length;
    }
  }

  return max;
}

function loadDataGrid(plot, grid, edFilter){
  var numCol = numOfColumn(plot);
  var model = plotModel(plot, numCol);
  var colProps = colDataProps(numCol + 1);
  var settings = {
    data: model.data,
    dataSchema: model.schema,
    rowHeaders: true,
    colHeaders: true,
    columns: colProps,
    afterChange: function(change){
      plot.replot({resetAxes: true});
    }
  }
  
  if(edFilter){
    settings.cells = edFilter;
  }
    
  grid.handsontable(settings);

}

function resetDG(chartEditor, dataGrid){
  if(chartEditor.data('dataGrid')){
    dataGrid.handsontable('destroy');
    chartEditor.data('dataGrid', null);
  }
}

function disableControllers(){

}

function editableFilter(data){
  var max = 0;
  for(var i = 0, l = data.length; i < l; i++){
    if(data[i].length > max){
      max = data[i].length;
    }
  }

  return function(row, col, prop){
    var cellProps = {};

    if(row == 0){
      if(col < max + 1){
        cellProps.readOnly = true;
      }
    }else{
      if(col == 0){
        cellProps.readOnly = true;
      }else{
        if((col - 1) < data[row - 1].length){
          cellProps.readOnly = true;
        }
      }
    }

    return cellProps;
  };
}

function fireQuoteModal(event){
  event.preventDefault();
  var quotePanel = $('#quote_panel');
  var postId = $(this).attr('data-post-id');
  var $post = $(this).parents('.post');
  var $body = quotePanel.find('.modal-body');
  var plot = $post.find('.plot').data('plot');

  $body.find('.user_name').append(buildUserNameLink($post.find('.user_name').text())).end()
       .find('.post_time').text($post.find('.post_time').text()).end()
       .find('.comment').text($post.find('.comment').text()).end();

  quotePanel.one('shown.bs.modal', function(e){
    if(plot){
      var cplot = $.jqplot('quotePlot', plot.data, plot.options);
      $('#quotePlot').data('plot', cplot);
    }else{
      $('#quotePlot').addClass('hidden');
    }
  });

  quotePanel.data('quoteId', postId);
  
  quotePanel.modal();
}

function fireReplyModal(event){
  event.preventDefault();
  
  var replyPanel = $('#reply_panel');
  var postId = $(this).attr('data-post-id');
  var $post = $(this).parents('.post');
  var $body = replyPanel.find('.modal-body');
  var plot = $post.find('.plot').data('plot');
  var userName = $post.find('.user_name').text();

  $body.find('.user_name').append(buildUserNameLink(userName)).end()
       .find('.post_time').text($post.find('.post_time').text()).end()
       .find('.comment').text($post.find('.comment').text()).end();

  $('#reply_comment').val('@' + userName + ' ');

  replyPanel.one('shown.bs.modal', function(e){
    if(plot){
      var cplot = $.jqplot('replyPlot', plot.data, plot.options);
      $('#replyPlot').data('plot', cplot);
    }else{
      $('#replyPlot').addClass('hidden');
    }
  });

  replyPanel.data('postId', postId);
  
  replyPanel.modal();
}

// Remove the original reply target from TL
function beforeRefreshTL(replyId){
  if(typeof replyId !== 'undefined'){
    postIdForReply = $('#reply_panel').data('postId');

    $('#tl_stream').find('#post_' + postIdForReply).parents('.panel').remove();
  }
}

function buildUserNameLink(userName){
  return $('<strong><a href="/user/' + escapeHTML(userName) + '">' + escapeHTML(userName) + '</a></strong>');
}

function formatUserLink(str){
  var fmt = escapeHTML(str);

  return fmt.replace(/(@(\w+)) /g, '<a href="/user/$2">$1</a> ');
}

function printError(errors, resultDomId){
  var res = '';
  for(var attr in errors){
    var msgs = errors[attr];
    for(var i = 0, l = msgs.length; i < l; i++){
      res += ('<div class="warning-msg">' +
              '<span class="glyphicon glyphicon-warning-sign" aria-hidden="true"></span>' +
              toScreen(attr) + " " + msgs[i] + "</div>");
    }
  }

  res += '<br>'
  $(resultDomId).html(res);
}

function toScreen(attr){
  switch(attr){
    case "name": return "User Name";
    case "email": return "E-mail";
    case "password": return "Password";
    case "comment": return "Comment";
    case "title": return "Title";
    case "xlabel": return "X-Axis Label";
    case "ylabel": return "Y-Axis Label";
    case "series_label": return "Series Label";
    default: return attr;
  }
}

function regulatePosts(stream){
  for(var i = 0; i < stream.find('.post').length; i++){
    var $posts = stream.find('.post');
    var l = $posts.length;
    var $post1 = $($posts[i]);
    var postId = $post1.attr('id');
    
    for(var j = i + 1; j < l; j++){
      var $post2 = $($posts[j]);

      if($post2.attr('id') == postId){
        var $post2Panel = $post2.parents('.panel');
        if($post2Panel.children('.panel-body').length == 0){
          $post2Panel.remove();
          continue;
        }
        
        var $li = $('<li class="list-group-item"></li>')
            .append($post2Panel.find('li .post'));
        $post1.parents('.panel').find('ul').append($li);

        $post2Panel.remove();
      }
    }
  }
}

$('#time_stamp').live('click', function(event){
  event.preventDefault();
  
  var $queryWord = $('#queryWord');
  var queryWord;
  if($queryWord.length > 0){
    queryWord = $queryWord.text();
  }

  var $userName = $('#userName');
  var userName;
  if($userName.length > 0){
    userName = $userName.text();
  }
  
  refreshTimeLine('#main_contents', userName, queryWord);
});

$('#tail_time_stamp').live('click', function(event){
  event.preventDefault();

  var $queryWord = $('#queryWord');
  var queryWord;
  if($queryWord.length > 0){
    queryWord = $queryWord.text();
  }

  var $userName = $('#userName');
  var userName;
  if($userName.length > 0){
    userName = $userName.text();
  }
  
  getMore('#main_contents', userName, queryWord)
  
});

function tooltipInit(){
  $('.start-edit-btn').tooltip();
  $('.quote-btn').tooltip();
  $('.reply-btn').tooltip();
}

$(function(){
  $('#new_post').tooltip();
  $('#time_stamp').tooltip();
  $('#home_link').tooltip();
  $('#setting_link').tooltip();
  $('#sign_out_btn').tooltip();
  $('#autoscale_btn').tooltip();

  var chartEditor = $('#chart_editor');
  
  $('#post_panel').on('hide.bs.modal', function(e){
    $('#comment_txt').val('');
    var plot = chartEditor.data('plot');
    if(plot){
      plot.destroy();
      chartEditor.removeData('plot');
    }
    chartEditor.removeData('chart-id');
    chartEditor.removeData('edit-button');
    chartEditor.removeData('original-data');
    chartEditor.removeData('newFlag');
    $('.color-picker').minicolors('destroy');
    $('.series-controller').remove();
    $('#x_label').contents().remove();
    $('#y_label').contents().remove();
    $('#plot_title').contents().remove();
    resetDG(chartEditor, $('#dataGrid'));
    $('#file_selector').val('');
    $('#file_selector').removeClass('hidden');
    $('#series_generator').removeClass('hidden');
    $('#autoscale_btn').removeClass('hidden');
    $('#proc_result').html('');
    disableMouseMoveFilter();
    disableMouseDownFilter();
    disableRemovePointFilter();
  });

  $('#quote_panel').on('hide.bs.modal', function(e){
    var $body = $(this).find('.modal-body');

    $body.find('.user_name').text('').end()
        .find('.post_time').text('').end()
        .find('.comment').text('').end();
    var plot = $('#quotePlot').data('plot');
    if(plot){
      plot.destroy();
      $('#quotePlot').removeData('plot');
    }else{
      $('#quotePlot').removeClass('hidden');
    }
  });

  $('#reply_panel').on('hide.bs.modal', function(e){
    var $body = $(this).find('.modal-body');

    $body.find('.user_name').text('').end()
        .find('.post_time').text('').end()
        .find('.comment').text('').end()
        .find('#reply-comment').val('').end();
    var plot = $('#replyPlot').data('plot');
    if(plot){
      plot.destroy();
      $('#replyPlot').removeData('plot');
    }else{
      $('#replyPlot').removeClass('hidden');
    }

    $('#rpProcResult').html('');
  });
  
  $('#file_selector').on('change', function(evt){
    var file = evt.target.files[0];
    var newFlg = chartEditor.data('newFlag');
    
    if(file){
      var reader = new FileReader();
      reader.readAsText(file);

      reader.onload = function(e){
        var csvData = reader.result;
        var plotData = csv2jqplot(csvData);
        var cplot = chartEditor.data('plot');
        var dg = $('#dataGrid');

        if(newFlg){
          cplot.destroy();
          cplot = $.jqplot('chart_editor', plotData.data, plotData.options);
        }else{
          if(cplot.data.equals(plotData.data)){
            cplot.replot({data: plotData.data, resetAxes: true});
          }else{
            alert('update data failed');
            return;
          }
        }
        
        makeDataSync(cplot);
        chartEditor.data('plot', cplot);

        resetDG(chartEditor, dg);
        
        if(newFlg){
          loadDataGrid(cplot, dg);
        }else{
          loadDataGrid(cplot, dg,
                       editableFilter(chartEditor.data('original-data')));
        }
        
        chartEditor.data('dataGrid', dg.handsontable('getInstance'));
        resetControllerForDG(cplot, chartEditor.data('newFlag'));
      };
    }
  });

});

