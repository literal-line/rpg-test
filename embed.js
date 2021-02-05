if (window.location.search === '?fullscreen') {
    document.body.style.overflow = 'hidden';
    document.getElementById('embedBox').style.display = 'none';
}

function copyString(str) {
    var textarea = document.createElement('textarea');
    textarea.textContent = str;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

function embedGame() {
    var iframeCode = '<iframe width="%widthValue%" height="%heightValue%" src="http://rpg-test.quique.gq/?fullscreen"></iframe>';
    var widthValue = document.getElementById('widthValue').value;
    var heightValue = document.getElementById('heightValue').value;
    if (!widthValue) widthValue = 768;
    if (!heightValue) heightValue = 432;
    iframeCode = iframeCode.replace('%widthValue%', widthValue);
    iframeCode = iframeCode.replace('%heightValue%', heightValue);
    copyString(iframeCode);
    document.getElementById('copyMsg').style.display = 'block';
}
