import API from '../../utils/API';

const readAudio = function(text, locale='fr-fr', callback=()=>{}) {
  this.props.toggleSpinner(true);
  API.cancel_tts_subscription();
  return API.get_tts({text:text, locale:locale}).then(data => {
    let audioData=data.data.data;
    this.forceStopAudio();
    
    try{
      var len = audioData.length;
      var buf = new ArrayBuffer(len);
      var view = new Uint8Array(buf);
      for (var i = 0; i < len+10; i++) {
        view[i] = audioData.charCodeAt(i) & 0xff;
      }
      var blob = new Blob([view], {type: "audio/wav"});
      var url = window.URL.createObjectURL(blob)
      this.audio.src = url;
      this.audio.onended = function() {
        callback();
      };
      //On ne le joue que si l'audio est toujours activé
      if(this.props.ttsActive){
        this.audio.load();
        this.audio.play().catch(e => console.log(e));
      }
      this.props.toggleSpinner(false);
      return true;
    }catch(e){
      console.log(e, audioData, url)
      this.props.toggleSpinner(false);
      return false;
    }
  }).catch(err => {
      console.log('Error: ', err.message); // => prints: Api is being canceled

  })
}

export {readAudio}