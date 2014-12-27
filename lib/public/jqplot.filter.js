function passThroughFilter(ev, gridpos, datapos, neighbor, plot){}

var mouseMoveFilter = ['jqplotMouseMove', passThroughFilter];
var mouseDownFilter = ['jqplotMouseDown', passThroughFilter];
var removePointFilter = ['evRemovePoint', passThroughFilter];

function setMouseMoveFilter(filter){
  mouseMoveFilter[1] = filter;
}

function setMouseDownFilter(filter){
  mouseDownFilter[1] = filter;
}

function setRemovePointFilter(filter){
  removePointFilter[1] = filter
}

function disableMouseMoveFilter(){
  mouseMoveFilter[1] = passThroughFilter;
}

function disableMouseDownFilter(){
  mouseDownFilter[1] = passThroughFilter;
}

function disableRemovePointFilter(){
  removePointFilter[1] = passThroughFilter;
}


(function($){
  $.jqplot.eventListenerHooks.push(mouseMoveFilter);
  $.jqplot.eventListenerHooks.push(mouseDownFilter);
  $.jqplot.eventListenerHooks.push(removePointFilter);
  $.jqplot.eventListenerHooks.push(['evAddPoint', addPoint]);
  $.jqplot.eventListenerHooks.push(['evRemovePoint', removePoint]);
  $.jqplot.eventListenerHooks.push(['evToggleScaleMode', toggleScaleMode]);
})(jQuery);

