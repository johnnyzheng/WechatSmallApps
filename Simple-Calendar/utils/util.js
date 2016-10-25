function formatTime( date ) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [ year, month, day ].map( formatNumber ).join( '/' ) + ' ' + [ hour, minute, second ].map( formatNumber ).join( ':' )
}

function formatNumber( n ) {
  n = n.toString()
  return n[ 1 ] ? n : '0' + n
}

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function( c ) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : ( r & 0x3 | 0x8 );
    return v.toString( 16 );
  });
}

module.exports = {
  formatTime: formatTime,
  guid: guid
}
