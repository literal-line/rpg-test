// rpg-test by Literal Line
// more at quique.gq

var EMBED = (function() {
  document.head.insertAdjacentHTML('beforeend', '<style>#embedBox > * { padding: 5px; margin: 5px; } #embedBox div { display: inline-block;}</style>');
  document.body.insertAdjacentHTML('beforeend', '<div id="embedBox" style="padding: 25px"><p>Embed this game on your site!</p><div>Width: <input id="widthValue" type="number" placeholder="768" value="768"></div><div>Height: <input id="heightValue" type="number" placeholder="432" value="432"></div><p><a href="javascript:EMBED.getCode()" style="border: 3px double #d1401f; padding: 5px">Copy HTML code</a></p><p id="copyMsg" style="display: none; color: #d1401f">Copied to clipboard!</p></div>');
  
  if (window.location.search === '?fullscreen') {
    document.body.style.overflow = 'hidden';
    document.getElementById('embedBox').style.display = 'none';
  }
  
  var copyString = function (str) {
    var textarea = document.createElement('textarea');
    textarea.textContent = str;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }

  return {
    getCode: function () {
      var iframeCode = '<iframe style="border: none" width="%widthValue%" height="%heightValue%" src="http://rpg-test.quique.gq/?fullscreen"></iframe>';
      var widthValue = document.getElementById('widthValue').value;
      var heightValue = document.getElementById('heightValue').value;
      if (!widthValue) widthValue = 768;
      if (!heightValue) heightValue = 432;
      iframeCode = iframeCode.replace('%widthValue%', widthValue);
      iframeCode = iframeCode.replace('%heightValue%', heightValue);
      copyString(iframeCode);
      document.getElementById('copyMsg').style.display = 'block';
    }
  } 
})();
