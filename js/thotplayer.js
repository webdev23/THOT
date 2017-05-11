//~ Block console.info
//~ console.info = function() {}

/*** 
 * THOT | This HTML Orgasmic Turntable
 * Dual deck audio player with crossfader and dual 7 bands Equalizer
 * Find songs in many local folders to organize a random playlist
 * Full keyboard controls
 ***
 *  Nico KraZhtest | 2017 | ponyhacks.com
 ***
 * Keyboard events (Azerty):
 * ------------------------*
 * Space bar: Play random track with fader automation
 *-- 
 * [Ctrl+Enter]:  Open deckA file manager 
 * [Shift+Enter]: Open deckB file manager
 *--
 * [,]: Random track on both decks
 * [;]: Random Track deck A 
 * [:]: Random Track deck B
 * [!]: Copy deckA track to deckB
 *--
 * [a/z]: Slider track automations with delays
 *--
 * [Ctrl+!]:  Copy deckA track to deckB
 * [Shift+!]: Copy deckB track to deckA
 *--
 * [Ctrl+Left/Right]: Main Slider left/right 
 * [Alt+Up/Down]:     Main Slider switch
 * [Ctrl+Up/Down]:    Ratio slider up/down 
 * [Alt+Up/Down]:     Ratio slider switch
 *--
 ***
 * Basic usage from js:
 * Check the current playlist tracks array
 * list
 *  
 * Or for the third track:
 * list[2]
 * 
 * Add track to playlist. 
 * (Accept both local, network, or blub url)
 * list.push("")
 * 
 * Check the current playlist index 
 * playlist
 * 
 * Random tracks
 * trackRandom()
 * trackRandomA()
 * trackRandomB()
 * 
 * Play the playlist numbered 13 on deckA:
 * deckA.src = list[13]
 * 
 * Fade automation from the deck B to A in 35 seconds 
 * autoDeckA(350)
 * 
 * Show the Equalizer:
 * showEq("off")
 * showEq("on")
 * 
 * Poster animation pause:
 * posterPause("on")
 * posterPause("off")
 * 
 * */
'use strict'

// css <link rel="stylesheet" href="css/style.css">
var targtCss = document.getElementsByTagName('*')[1],
injCss = document.createElement('link')
injCss.rel = "stylesheet"
injCss.href = 'https://ponyhacks.com/open/apps/player/css/thot.css'
targtCss.appendChild(injCss)

// We need to create a container to hold
let sp = document.createElement("SPAN")

// Our audio player
let a = document.createElement("audio")

// They will need some buttons to evolve in the playlist
let deckAnext = document.createElement("button")
let deckAlast = document.createElement("button")
let deckBnext = document.createElement("button")
let deckBlast = document.createElement("button")
deckAnext.className = "media deckplaylist deckAnext"
deckAlast.className = "media deckplaylist deckAlast"
deckBnext.className = "media deckplaylist deckBnext"
deckBlast.className = "media deckplaylist deckBlast"

// Give user control power
a.setAttribute("controls", "")

// Random track on track end
a.setAttribute("onended", "trackRandomA()")

// Random track if error
a.setAttribute("onerror", "trackRandomA()")

// We need an attribute container for the title
a.setAttribute("data-track", "")

// When datas are loaded, display the track title, then start the player
a.setAttribute("onloadeddata", "trackNameA()")
a.setAttribute("ondurationchange", "trackNameA()")

// Allow tracks to be dropped
a.setAttribute("ondrop", "drop(event)")
a.setAttribute("ondragover", "allowDrop(event)")

// Blink a led if a track is a playing
a.setAttribute("onplaying", "ledAcheck();notifTrack(deckA)")

// Check blink state in case of seeking 
a.setAttribute("onseeked", "ledAcheck()")
a.setAttribute("ontimeupdate", "ledAcheck()")

// If paused stop the led 
a.setAttribute("onpause", "ledA.className = 'led_off'")

// Now let's name our nice audio object, to later call him
a.id = "deckA"

// A css class, to style both players
a.className = "dropzone"

// Yeah! We need two players to make pony mixes!
// So let's create another one:
let deckB = document.createElement("audio")
    deckB.setAttribute("controls", "")
    deckB.setAttribute("onerror", "trackRandomB()")
    deckB.setAttribute("onended", "trackRandomB()")
    deckB.setAttribute("data-track", "")
    deckB.setAttribute("onloadeddata", "trackNameB()")
    deckB.setAttribute("ondurationchange", "trackNameB()")
    deckB.setAttribute("ondrop", "drop(event)")
    deckB.setAttribute("ondragover", "allowDrop(event)")
    deckB.setAttribute("onplaying", "ledBcheck();notifTrack(deckB)")
    deckB.setAttribute("onseeked", "ledBcheck()")
    deckB.setAttribute("ontimeupdate", "ledBcheck()")
    deckB.setAttribute("onpause", "ledB.className = 'led_off'")
    deckB.className = "dropzone"
    deckB.id = "deckB"

// Now we need to inject our players in the document
// Let's focus anywhere, like the first html <div>
let target = document.getElementsByTagName("*")[0]

let mixer = document.createElement("div")
mixer.className = "main"
mixer.innerHTML = `
<div class="mixer" draggable>
 <!-- Deck A -->
 <div class="left">
<form>
    <input type="range" id="lowGainKnob" data-wait="0" class="mix" value="50" step="1"
     min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mix invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mix stop'}return false" oninput="changeGain(this.value, 'lowGain');mirrorEq(this.id,this.value)" />
    <input type="range" id="lowGain02Knob" data-wait="0" class="mix" value="50" step="1"
     min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mix invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mix stop'};return false" oninput="changeGain(this.value, 'lowGain02');mirrorEq(this.id,this.value)" />
    <input type="range" id="lowGain03Knob" data-wait="0" class="mix" value="50" step="1"
     min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mix invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mix stop'};return false" oninput="changeGain(this.value, 'lowGain03');mirrorEq(this.id,this.value)" />
    <input id="mid" data-wait="0" type="range" value="0" class="mix" step="0.1" min="3"
     max="7" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mix invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mix stop'};return false" oninput="changeGain(this.value, 'midGain');mirrorEq(this.id,this.value)" />
    <input type="range" id="highGain05Knob" data-wait="0" class="mix" value="50" step="1"
     min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mix invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mix stop'};return false" oninput="changeGain(this.value, 'highGain05');mirrorEq(this.id,this.value)" />
    <input type="range" id="highGain06Knob" data-wait="0" class="mix" value="50" step="1"
     min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mix invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mix stop'};return false" oninput="changeGain(this.value, 'highGain06');mirrorEq(this.id,this.value)" />
    <input type="range" id="highGainKnob" data-wait="0" class="mix" value="50" step="1"
     min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mix invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mix stop'};return false" oninput="changeGain(this.value, 'highGain');mirrorEq(this.id,this.value)" />
</form>
 </div>

 <!-- Deck B -->
 <div>
     
 <form class="mixRight">
    <!-- <label>Low Gain</label> -->
    <input type="range" id="lowGainKnob_deckB" data-wait="0" class="mixreversed" value="50"
     step="1" min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mixreversed invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mixreversed stop'};return false" oninput="changeGaindeckb(this.value, 'lowGain');mirrorEq(this.id,this.value)" />
    <input type="range" id="lowGain02Knob_deckB" data-wait="0" class="mixreversed" value="50"
     step="1" min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mixreversed invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mixreversed stop'};return false" oninput="changeGaindeckb(this.value, 'lowGain02');mirrorEq(this.id,this.value)" />
    <input type="range" id="lowGain03Knob_deckB" data-wait="0" class="mixreversed" value="50"
     step="1" min="0" max="100" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mixreversed invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mixreversed stop'};return false" oninput="changeGaindeckb(this.value, 'lowGain03');mirrorEq(this.id,this.value)" />
    <input id="mid_deckB" type="range" value="400" data-wait="0" class="mixreversed" step="5"
     min="1" max="600" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mixreversed invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mixreversed stop'};return false" oninput="changeGaindeckb(this.value, 'midGain');mirrorEq(this.id,this.value)" />
    <input type="range" id="highGain05Knob_deckB" data-wait="0" class="mixreversed" value="50"
     step="1" min="0" max="400" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mixreversed invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mixreversed stop'};return false" oninput="changeGaindeckb(this.value, 'highGain05');mirrorEq(this.id,this.value)" />
    <input type="range" id="highGain06Knob_deckB" data-wait="0" class="mixreversed" value="50"
     step="1" min="0" max="400" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mixreversed invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mixreversed stop'};return false" oninput="changeGaindeckb(this.value, 'highGain06');mirrorEq(this.id,this.value)" />
    <input type="range" id="highGainKnob_deckB" data-wait="0" class="mixreversed" value="50"
     step="1" min="0" max="400" oncontextmenu="if(this.dataset.wait=='0'){this.dataset.wait='1';this.className = 'mixreversed invertalert';holdEq(this.id)}else{this.dataset.wait='0';this.className = 'mixreversed stop'};return false" oninput="changeGaindeckb(this.value, 'highGain');mirrorEq(this.id,this.value)" />
</form>
  </div>
    </div>
 <br>
   <br>
<div class="ctrlBlock"></div>
<!-- Slider -->
<form class="slider" id="sliderForm">
 <input type="range" id="sliderTracks" name="slidertracks" 
   oninput="fadeTracks()" oncontextmenu="clearAutomation();return false" title="Right click to reset all automation" value="0" step="1" min="1" max="99" />
 <input type="range" oninput="fadeTracks()" id="sliderTracksRatio" 
  value="5" step="5" min="5" max="400" />
</form>
<div class="files">
 <form id="userfiles" method="POST" enctype="multipart/form-data" onchange="pwnColor()">
  <input type="file" id="aud" name="trcka" onchange="tagA()" webkitdirectory />
  <input type="file" id="audB" name="trckb" onchange="tagB()" accept="audio/*" webkitdirectory />
</form>
 </div>
<div class="filesBlock">
 <span id="trackA" class=""></span> 
 <span id="trackB" class=""></span> 
<br>
</div>

<!-- Dice button -->
<button type="button" id="dice" onclick="return trackRandom();">🔀</button>

<button type="button" class="ctrlBb" onclick="return resetAll();">&#7360;</button>

<button type="button" class="buttonshoweq" value="on" 
onclick="if(this.value=='off'){this.value='on'}else{this.value='off'};showEq(this.value);">
&#128335;</button>

<button type="button" id="buttonNotif" class="active" value="on" 
onclick="if(this.value=='off'){this.value='on';this.className='active'}else{this.value='off';this.className=''}" title="Toggle notifications">&#9748;</button>

<button type="button" id="buttonLyrics" onclick="checkNet();lyrics(deckA.src)" title="Search lyrics and more...">🖧</button>

<div id="offline">🖧</div>

<!-- Files lists-->
<ul id="listing" oninput="pwnColor()"></ul>
<ul id="listingB" oninput="pwnColor()"></ul>

<form onchange="localStorage.setItem('baseColor', color.value)">
    <input type="color" type="text" name="color" value="#FFFFFF" id="pwnClr" 
    oninput="pwnColor()" />
</form>
 </div>
<div class="poster" id="posterblock" onmouseleave="posterPause('off')">
 <span id="posterA" class="filesblock" onmouseover="posterPause('on')"></span> 
 <span id="posterB" class="filesblockright"></span> 
 </div>

<!--
 Firefox bug playbackRate and web audio api won't work
https://bugzilla.mozilla.org/show_bug.cgi?id=966247
-->
<form id="rateControls">
    <span id="pitchAlab">1.000</span>
    <span id="pitchBlab">1.000</span>
    
    <input type="range" value="500" step="0.1" min="250" max="2000" id="pitchA"
     oninput="pitchAlab.innerHTML=(this.value/500).toFixed(3);\
     deckA.playbackRate=pitchAlab.innerHTML" oncontextmenu="javascript:this.value='500';\
     pitchAlab.innerHTML=(this.value/500).toFixed(3);\
     deckA.playbackRate=pitchAlab.innerHTML;return false;" 
     title="Deck A playback Rate | Right click to reset">
    <input type="range" value="500" step="0.1" min="250" max="2000" id="pitchB"
    oninput="pitchBlab.innerHTML=(this.value/500).toFixed(3);\
    deckB.playbackRate=pitchBlab.innerHTML" oncontextmenu="javascript:this.value='500';\
    pitchBlab.innerHTML=(this.value/500).toFixed(3);\
    deckB.playbackRate=pitchBlab.innerHTML;return false;"
    title="Deck B playback Rate | Right click to reset">
</form>

<span class="bonjour" title="Toggle fullscreen">
    <b>𝄞</b>
</span>

<span id="ledA" onclick="lyrics(deckA)"></span>
<span id="ledB" onclick="lyrics(deckB)"></span>


<div id="artist">yo</div>
<span id="closelyrics" onclick="document.documentElement.style.cssText += ' ;transform:translateY(0px)';fixScroll()">✖</span>
<button type="button" id="closeFlex" class="" value="on" 
onclick="if(this.value=='off'){this.value='on';this.className='active';artist.style.display = 'block'}else{this.value='off';this.className='';artist.style.display='flex'}" title="Display as flexboxes">⛭</button>

<div id="artistInfos" data-keyboard="on" onmouseover="this.dataset.keyboard='off';console.log('Keyboard: '+this.dataset.keyboard)" onmouseout="this.dataset.keyboard='on';console.log('Keyboard: '+this.dataset.keyboard)">
 <form onsubmit='ajaxTrack(artistrack.value);return false'>
  <input id='artistrack' title="Artist - Track?" value='' />
   <input hidden type='submit' />
 </form>
</div>
<div id="artistArchives">
 </div>

`

// Construct the DOM
    target.appendChild(mixer)
    mixer.appendChild(deckAnext)
    mixer.appendChild(deckAlast)
    mixer.appendChild(deckBnext)
    mixer.appendChild(deckBlast)
    mixer.appendChild(sp)

// And insert both audio players as childrens
// This way our parents buttons can gently ask stuffs to their player childrens
    sp.appendChild(a)
    sp.appendChild(deckB)

// This childs sometimes brings mp3 crap at home 
// ...We need to connect them to the web audio api...
let context = new AudioContext()
// We connect the bad son player A first
let mediaElement = a
let sourceNode = context.createMediaElementSource(mediaElement)
//~ var node = context.createScriptProcessor(1024, 1, 1);
//~ node.onaudioprocess = function (e) {
  //~ var output = e.outputBuffer.getChannelData(0);
  //~ for (var i = 0; i < output.length; i++) {
    //~ output[i] = Math.random();
  //~ }
//~ };
//~ node.connect(context.destination);
// We need gain control 
let gainDb = -40.0
// And band pass filter to some more humans bands 290hz, 360hz, 432hz...
// We are going to build a 7 band equalizer
let bandSplit = [290, 360, 432, 932, 1728, 3600, 3600]
// Define the lower band to filter down (lowpass)
let hBand = context.createBiquadFilter()
    hBand.type = "lowshelf"
    hBand.frequency.value = bandSplit[0]
    hBand.gain.value = gainDb
// And an amplifier to give gain on this band if needed
let hInvert = context.createGain()
    hInvert.gain.value = -20.23
// Second band lowpass filter
let hBand06 = context.createBiquadFilter()
    hBand06.type = "lowshelf"
    hBand06.frequency.value = bandSplit[1]
    hBand06.gain.value = gainDb
// And his amplifier
let hInvert06 = context.createGain()
    hInvert06.gain.value = -20.23
// Third band
let hBand05 = context.createBiquadFilter()
    hBand05.type = "lowshelf"
    hBand05.frequency.value = bandSplit[2]
    hBand05.gain.value = gainDb
// Third band lowpass filter
let hInvert05 = context.createGain()
    hInvert05.gain.value = -20.23
// Middle band amplifier
let mBand = context.createGain()
// Lower band lowpass filter
let lBand02 = context.createBiquadFilter()
    lBand02.type = "highshelf"
    lBand02.frequency.value = bandSplit[3]
    lBand02.gain.value = gainDb

let lInvert02 = context.createGain()
    lInvert02.gain.value = -20.23

let lBand03 = context.createBiquadFilter()
    lBand03.type = "highshelf"
    lBand03.frequency.value = bandSplit[4]
    lBand03.gain.value = gainDb

let lInvert03 = context.createGain()
    lInvert03.gain.value = -20.23

let lBand = context.createBiquadFilter()
    lBand.type = "highshelf"
    lBand.frequency.value = bandSplit[1]
    lBand.gain.value = gainDb

let lInvert = context.createGain()
    lInvert.gain.value = -20.23

// Connect sources and filters
    sourceNode.connect(lBand)
    sourceNode.connect(lBand02)
    sourceNode.connect(lBand03)
    sourceNode.connect(mBand)
    sourceNode.connect(hBand05)
    sourceNode.connect(hBand06)
    sourceNode.connect(hBand)

// connect filters to their amplifier nodes
    hBand.connect(hInvert)
    hBand05.connect(lInvert02)
    hBand06.connect(lInvert03)
    lBand03.connect(hInvert06)
    lBand02.connect(hInvert05)
    lBand.connect(lInvert)

// High pass
    hInvert.connect(mBand)
    hInvert06.connect(mBand)
    hInvert05.connect(mBand)
    lInvert03.connect(mBand)
    lInvert02.connect(mBand)
    lInvert.connect(mBand)

// Create gain node for amplifiers
let lGain = context.createGain(),
    lGain02 = context.createGain(),
    lGain03 = context.createGain(),
    mGain = context.createGain(),
    hGain05 = context.createGain(),
    hGain06 = context.createGain(),
    hGain = context.createGain()

// Cnnect amplifiers nodes to gain
    lBand.connect(lGain)
    lBand02.connect(hGain06)
    lBand03.connect(hGain05)
    mBand.connect(mGain)
    hBand05.connect(lGain03)
    hBand06.connect(lGain02)
    hBand.connect(hGain)

// Create a gain node to receive the main stream 
let sum = context.createGain()
// Connect each lowpasses nodes to the main gain
    lGain.connect(sum)
    lGain02.connect(sum)
    lGain03.connect(sum)
    mGain.connect(sum)
    hGain05.connect(sum)
    hGain06.connect(sum)
    hGain.connect(sum)
// Connect the audio player deck A to the speakers
    sum.connect(context.destination)

/* Deck B EQualizer
 * 
 *                                                                  */
// Connect the players to the web audio api
let contextdeckb = context,
    mediaElementdeckB = deckB,
    sourceNodedeckb = contextdeckb.createMediaElementSource(mediaElementdeckB),
    gainDbdeckb = 0.01

// EQ Properties

let hBanddeckb = contextdeckb.createBiquadFilter()
    hBanddeckb.type = "lowshelf"
    hBanddeckb.frequency.value = bandSplit[0]
    hBanddeckb.gain.value = gainDbdeckb

let hInvertdeckb = contextdeckb.createGain()
    hInvertdeckb.gain.value = -40.23

let hBand06deckb = contextdeckb.createBiquadFilter()
    hBand06deckb.type = "lowshelf"
    hBand06deckb.frequency.value = bandSplit[1]
    hBand06deckb.gain.value = gainDbdeckb

let hInvert06deckb = contextdeckb.createGain()
    hInvert06deckb.gain.value = -40.23

let hBand05deckb = contextdeckb.createBiquadFilter()
    hBand05deckb.type = "lowshelf"
    hBand05deckb.frequency.value = bandSplit[2]
    hBand05deckb.gain.value = gainDbdeckb

let hInvert05deckb = contextdeckb.createGain()
    hInvert05deckb.gain.value = -40.23

let mBanddeckb = contextdeckb.createGain()
    mBanddeckb.gain.value = -0.01

let lBand02deckb = contextdeckb.createBiquadFilter()
    lBand02deckb.type = "highshelf"
    lBand02deckb.frequency.value = bandSplit[3]
    lBand02deckb.gain.value = gainDbdeckb

let lInvert02deckb = contextdeckb.createGain()
    lInvert02deckb.gain.valuedeckb = -40.23

let lBand03deckb = contextdeckb.createBiquadFilter()
    lBand03deckb.type = "highshelf"
    lBand03deckb.frequency.value = bandSplit[4]
    lBand03deckb.gain.value = gainDbdeckb

let lInvert03deckb = contextdeckb.createGain()
    lInvert03deckb.gain.value = -60.23

let lBanddeckb = contextdeckb.createBiquadFilter()
    lBanddeckb.type = "highshelf"
    lBanddeckb.frequency.value = bandSplit[0]
    lBanddeckb.gain.value = gainDbdeckb

let lInvertdeckb = contextdeckb.createGain()
    lInvertdeckb.gain.value = -60.23
    
    sourceNodedeckb.connect(lBanddeckb)
    sourceNodedeckb.connect(lBand02deckb)
    sourceNodedeckb.connect(lBand03deckb)
    sourceNodedeckb.connect(mBanddeckb)
    sourceNodedeckb.connect(hBand05deckb)
    sourceNodedeckb.connect(hBand06deckb)
    sourceNodedeckb.connect(hBanddeckb)
    
    hBanddeckb.connect(hInvertdeckb)
    hBand05deckb.connect(lInvert02deckb)
    hBand06deckb.connect(lInvert03deckb)
    lBand03deckb.connect(hInvert06deckb)
    lBand02deckb.connect(hInvert05deckb)
    lBanddeckb.connect(lInvertdeckb)
    
    hInvertdeckb.connect(mBanddeckb)
    hInvert06deckb.connect(mBanddeckb)
    hInvert05deckb.connect(mBanddeckb)
    lInvert03deckb.connect(mBanddeckb)
    lInvert02deckb.connect(mBanddeckb)
    lInvertdeckb.connect(mBanddeckb)

let lGaindeckb = contextdeckb.createGain()
let lGain02deckb = contextdeckb.createGain()
let lGain03deckb = contextdeckb.createGain()
let mGaindeckb = contextdeckb.createGain()
let hGain05deckb = contextdeckb.createGain()
let hGain06deckb = contextdeckb.createGain()
let hGaindeckb = contextdeckb.createGain()


    mGaindeckb.gain.value = -0.001

    lBanddeckb.connect(lGaindeckb)
    lBand02deckb.connect(hGain06deckb)
    lBand03deckb.connect(hGain05deckb)
    mBanddeckb.connect(mGaindeckb)
    hBand05deckb.connect(lGain03deckb)
    hBand06deckb.connect(lGain02deckb)
    hBanddeckb.connect(hGaindeckb)
    
    let sumdeckb = contextdeckb.createGain()
    lGaindeckb.connect(sumdeckb)
    lGain02deckb.connect(sumdeckb)
    lGain03deckb.connect(sumdeckb)
    mGaindeckb.connect(sumdeckb)
    hGain05deckb.connect(sumdeckb)
    hGain06deckb.connect(sumdeckb)
    hGaindeckb.connect(sumdeckb)

    sumdeckb.gain.value = 0.1

//~ sumdeckb.connect(contextdeckb.destination)
    sumdeckb.connect(context.destination)

// Array of tracks for the base playlist
let list = ["05seventheclipse.mp3",
  "//ponyhacks.com/img/www/medias/fw/perfect-blind-passing-the-veil.mp3",
  "//ponyhacks.com/img/www/medias/fw/man-of-no-ego-celestial-medicine.mp3",
  "//ponyhacks.com/img/www/medias/fw/ursus-formation.mp3"
] //,"http://www.ektoplazm.com/mp3/phillax-chaos-theory.mp3"]
//^|^|^
// This include the track number 0, for a total of 4 tracks_______^^|^
let listLength = list.length 

// Initiate the playlist track number
let playlist = "0";

// Text for the buttons
    deckAnext.innerHTML = "⏭";
    deckAlast.innerHTML = "⏭";
    deckBnext.innerHTML = "⏭";
    deckBlast.innerHTML = "⏭";

// Give needed attributes to the audio player
    deckB.src = list[0];

// Listen for a click event on the first FOO button
deckAnext.onclick = function() {
  // if playlist number in range
  if (playlist >= 1) {
    // decrement  
    playlist--;
    // Change the player source and reload
    deckA.src = list[playlist];
    deckA.load()
    deckA.play()
    // Avoid collision
    return false;
  } // Else jump to last track
  else {
    playlist = list.length;
    deckA.src = list[list.length];
    deckA.load()
    deckA.play()
    console.info("This is the last track: " + playlist);
    // Important to avoid collision 
    return false;
  }
}

// Similar actions for the forward BAR button
deckAlast.onclick = function() {
  if (playlist < list.length) {
    playlist++;
    deckA.src = list[playlist];
    deckA.load()
    deckA.play()
    // Avoid collision
    return false;
  } else {
    playlist = 0;
    deckA.src = list[playlist];
    deckA.load()
    deckA.play()
    console.info("Now coming back to the first track");
    return false;
  }
}

deckBnext.onclick = function() {
  // if playlist number in range
  if (playlist >= 1) {
    // decrement  
    playlist--;
    // Change the player source and reload
    deckB.src = list[playlist];
    deckB.load()
    deckB.play()
    // Avoid collision
    return false;
  } // Else jump to last track
  else {
    playlist = list.length;
    deckB.src = list[list.length];
    deckB.load()
    deckB.play()
    console.info("This is the last track: " + playlist);
    // Important to avoid collision 
    return false;
  }
}

// Similar actions for the forward BAR button
deckBlast.onclick = function() {
  if (playlist < list.length) {
    playlist++;
    deckB.src = list[playlist];
    deckB.load()
    deckB.play()
    // Avoid collision
    return false;
  } else {
    playlist = 0;
    deckB.src = list[playlist];
    deckB.load()
    deckB.play()
    console.info("Now coming back to the first track");
    return false;
  }
}

// Reset Eq on load
resetAll();
// Watch for user file input on deck a playlist
document.getElementById("aud").addEventListener("change", function(event) {

  let output = document.getElementById("listing")
  let files = event.target.files;
  let URL = window.URL || window.webkitURL
for (let i = 0; i < files.length; i++) {
   if (files[i].type === "audio/mpeg" ||
       files[i].type === "audio/mp3"  ||
       files[i].type === "audio/flac" ||
       files[i].type === "image/jpeg" ||
       files[i].type === "video/ogg") {
    let item = document.createElement("li")
    let elemSrc = URL.createObjectURL(files[i])
    let elemPath = files[i].webkitRelativePath.replace(/["']/g, "")

    item.innerHTML += 
    "<a class='moonlist' onclick=\"deckB.src='"+
        elemSrc+"';autoDeckB(sliderTracksRatio.value);deckB.play();deckB.dataset.track='"+
        elemPath+"';this.className='mark'\">⮣</a> \
    <a class='moonlist' onclick=\"deckA.src='"+elemSrc+
        "';autoDeckA(sliderTracksRatio.value);this.className='mark';deckA.dataset.track='"+
        elemPath+"';deckA.play()\">⮢</a> \
    <a class='drag' draggable='true' ondragstart='drag(event)' data-track='"+
        elemPath+"' onclick=\"document.getElementsByTagName('audio')[0].src='" + 
        elemSrc + "';this.className='mark';deckA.dataset.track='"+elemPath+
        "'\">" + elemPath + "</a>"

    list.push(elemSrc)
    
    if (files[i].type === "image/jpeg"){
        item.style.display="none"
    }
    item.dataset.track = elemPath;
    item.children[2].id = elemSrc;
    item.id = files[i].name.replace(/['"-_./!?$&:;~#*\+\-\\ )(]+/g, '') // Sanitize
    //~ console.log(item.id)
    output.appendChild(item)
}}
    (function(){
    setTimeout(function(){ poster() }, 10000)
    })()
}, false)

// Watch for user file input on deck a playlist
document.getElementById("audB").addEventListener("change", function(event) {

  let output = document.getElementById("listingB")
  let files = event.target.files
  let URL = window.URL || window.webkitURL

  for (let i = 0; i < files.length; i++) {
      
   if (files[i].type == "audio/mpeg" ||
       files[i].type === "audio/mp3" ||
       files[i].type == "audio/flac" ||
       files[i].type == "image/jpeg" ||
       files[i].type == "video/ogg") {
    let item = document.createElement("li");
    let elemSrc = URL.createObjectURL(files[i])
    let elemPath = files[i].webkitRelativePath.replace(/["']/g, "")
    item.innerHTML = "<a class='moonlist' onclick=\"deckA.src='"+elemSrc+
        "';autoDeckA(sliderTracksRatio.value);deckA.dataset.track='"+elemPath+
        "';this.className='mark';deckA.play()\">⮢</a> \
        <a class='moonlist' onclick=\"deckB.src='"+elemSrc+
        "';autoDeckB(sliderTracksRatio.value);deckB.play();deckB.dataset.track='"+
        elemPath+"';this.className='mark'\">⮣</a> | \
        <a class='drag' draggable='true' ondragstart='drag(event)' data-track='"+
        elemPath+"' onclick=\"document.getElementsByTagName('audio')[1].src='" + 
        elemSrc + "';this.className='mark';\
        deckB.dataset.track='"+elemPath+"'\">" + elemPath + "</a>"
    
    list.push(elemSrc)
    
    if (files[i].type == "image/jpeg"){
        item.style.display="none"
    }
    item.dataset.track = elemPath
    item.dataset.title = ""
    item.dataset.art = ""

    item.id = files[i].name.replace(/['"-_./!?$&:;~#*\+\-\\ )(]+/g, '') // Sanitize
    //~ console.log(item.id)
    item.children[2].id = elemSrc

    output.appendChild(item)
}}
    (function(){
    setTimeout(function(){ poster() }, 10000)
    })()

}, false)


/* ### Tags, tracks names, lyrics, user infos */

/*
 * ID3 (v1/v2) Parser
 * 43081j
 * License: MIT, see LICENSE
 */
var targtId3 = document.getElementsByTagName('*')[1],
injId3 = document.createElement('script')
injId3.src= 'https://ponyhacks.com/open/apps/player/js/id3.js'
targtId3.appendChild(injId3)


function tagA(){
setTimeout(function(){
    let b =0, c = aud.files.length
              
    for (b = 0; b <= c; b++) {
    if (typeof aud.files[b] == "object") {
    if (aud.files[b].type == "audio/mpeg" ||
        aud.files[b].type == "audio/mp3"  ||
        aud.files[b].type == "audio/flac" ||
        aud.files[b].type == "image/jpeg" ||
        aud.files[b].type == "video/ogg") {
            //~ console.log(audB.files[b].name)
         let it = aud.files[b].name.replace(/['"-_./!?$&:;~#*\+\-\\ )(]+/g, '')

            //~ console.log(it)
            
             try {
                 id3(aud.files[b], function(err, tags) {
                console.log(tags)
                console.log(b+" "+c)
                let e = Object.entries(tags)
                document.getElementById(it).dataset.title = tags.title
                document.getElementById(it).dataset.art = tags.artist            
                //~ console.log(e[0,0])
                //~ console.log(audB.files[c])
                //~ window.clearInterval(tag)
                })}
                catch (err) {console.log(err)}
        }}}
    }, 1000)
}

function tagB(){
setTimeout(function(){
    let b =0, c = audB.files.length
            
    for (b = 0; b <= c; b++) {
    if (audB.files[b].type == "audio/mpeg" ||
        audB.files[b].type == "audio/mp3"  ||
        audB.files[b].type == "audio/flac" ||
        audB.files[b].type == "image/jpeg" ||
        audB.files[b].type == "video/ogg") {
        console.log(audB.files[b].name)
     let it = audB.files[b].name.replace(/['"-_./!?$&:;~#*\+\-\\ )(]+/g, '')

        console.log(it)
        id3(audB.files[b], function(err, tags) {
            console.log(err, tags)
            console.log(b+" "+c.length + " "+c)
         try {
            let e = Object.entries(tags)
            document.getElementById(it).dataset.title = tags.title
            document.getElementById(it).dataset.art = tags.artist            
            console.log(e[0,0])
            console.log(audB.files[c])
            window.clearInterval(tag)
            }
            catch (stfu) {}
    })}
    }}, 1000)
}

function lyrics(deck) {

let w = window.innerHeight,
    me = deck.src
    artist.innerHTML = "<span class='fetchalert'>😊 Fetching lyrics...</span>"
    artist.style.cssText += ";transform:translateY(-"+w*1+"px)"
    artistInfos.style.cssText += ";transform:translateY(-"+w*1+"px)"
    artistArchives.style.cssText += ";transform:translateY(-"+w*1+"px)"
    document.documentElement.style.cssText += " ;transform:translateY("+w*0.9+"px)"
    document.documentElement.style.cssText += " height:"+window.innerHeight+"px"
    artistInfos.style.display = "inline"
    artistArchives.style.display = "inline"
    ajax(me)
}

function ajax(me){
  try {
    let aId3title = document.getElementById(me).parentNode.dataset.title || ""
    let aId3artist = document.getElementById(me).parentNode.dataset.art || ""
    let aId3error = document.getElementById(me).parentNode.dataset.track || ""
   if (aId3title != null) {
    let lyrics = new XMLHttpRequest()
        lyrics.onreadystatechange = function() {
    if (lyrics.readyState == XMLHttpRequest.DONE) {
            console.log(lyrics.responseText)
            artist.innerHTML = "<li>"+lyrics.responseText +"</li>" ||
             "<span class='fetchalert'><h1> 😯 </h1></span>" 
        }}
        lyrics.open('GET', 'https://ponyhacks.com/open/api/lyrics/?title=' +
           aId3title + '&artist=' + aId3artist , true)
        lyrics.send(null)
        //~ artistInfos.innerHTML = ""
        artistrack.value = aId3artist + " " + aId3title 
        artistrack.value += " " + document.getElementById(me).parentNode.dataset.track.slice(0, -4)
        artistInfos.scrollTop = 0
        ajaxWiki()
        //~ ajaxArchives(encodeURI(aId3artist))
        ajaxArchives(encodeURI(artistrack.value))
    } else {
        artist.innerHTML = " 😕"
        artistrack.value = document.getElementById(me).parentNode.dataset.track
        artistrack.focus()
      }
    }
  catch (nope) {artist.innerHTML = " <h1>😱</h1>"}
}

function trackNameA() {
  try {
     trackA.innerHTML = document.getElementById(deckA.src).dataset.track
     document.title = document.getElementById(deckA.src).dataset.track
     deckA.title = document.getElementById(deckA.src).parentNode.dataset.title
     deckA.dataset.artist = document.getElementById(deckA.src).parentNode.dataset.art
     document.querySelectorAll("a").forEach(function(element) {element.style.cssText += ";opacity:1;animation-play-state:paused"})()
     document.getElementById(deckA.src).style.cssText += ";animation-play-state:running;animation: ledblink 0.5s infinite"
     document.getElementById(deckA.src).parentElement.children[0].style.cssText += ";animation-play-state:running;animation: ledblink 0.5s infinite"
     console.warn("DeckB now playing: " + document.getElementById(deckA.src).dataset.track)
    }
  catch (stfu) {}
  deckA.play()
}

function trackNameB() {
    try {
     trackB.innerHTML = document.getElementById(deckB.src).dataset.track
     document.title = document.getElementById(deckB.src).dataset.track
     deckB.title = document.getElementById(deckB.src).parentNode.dataset.title
     deckB.dataset.artist = document.getElementById(deckB.src).parentNode.dataset.art
     document.querySelectorAll("a").forEach(function(element) {element.style.cssText += ";opacity:1;animation-play-state:paused"})()
     document.getElementById(deckB.src).style.cssText += ";animation-play-state:running;animation: ledblink 0.5s infinite"
     document.getElementById(deckB.src).parentElement.children[1].style.cssText += ";animation: ledblink 0.5s infinite"
     console.warn("DeckB now playing: " + document.getElementById(deckB.src).dataset.track)
    }
    catch (stfu) {}
    deckB.play()
}

function notifTrack(deck) {
if (deck.title != "" &&
    deck.dataset.artist != "" &&
    deck.title != "null" &&
    deck.dataset.artist != "null") {
  try {
     let aId3title = deck.title,
         aId3artist = deck.dataset.artist
         info(aId3artist,aId3title)
    }
  catch (stfu) {}
 } 
 //~ else {}
}

function ledAcheck(){

    if (deckA.paused){
        ledA.className = 'led_off'
    }
    if (!deckA.paused){
      if ((deckA.duration - deckA.currentTime) >= 30.3) {
            ledA.className = 'led_on'
        }
    // Allow 600ms    
      if ((deckA.duration - deckA.currentTime) < 20 && (deckA.duration - deckA.currentTime) >= 19.4) {
       // Avoid breaking a track  
        if (deckA.volume >= 0.9) {
            autoDeckB(60)
            console.warn("Automix 6 seconds to deck B")
        }}
      if ((deckA.duration - deckA.currentTime) <= 30.3) { 
        ledA.className = 'led_warning'
        console.info("DeckA: " + (deckA.duration - deckA.currentTime).toFixed(0) +"s till end")
    }}
}

function ledBcheck(){

    if (deckB.paused){
        ledB.className = 'led_off'
    }
    if (!deckB.paused){
     if ((deckB.duration - deckB.currentTime) >= 30.3) {
            ledB.className = 'led_on'
        }
     if ((deckB.duration - deckB.currentTime) < 20 && (deckB.duration - deckB.currentTime) >= 19.4) {
       // Avoid to break a track  
       if (deckB.volume >= 0.9) {
        autoDeckA(60)
        console.warn("Automix 6 seconds to deck A")
        }}
     if ((deckB.duration - deckB.currentTime) <= 30.3) { 
        ledB.className = 'led_warning'
        console.info("DeckB: " + (deckB.duration - deckB.currentTime).toFixed(0) +"s till end")        
    }}
}

/* ### Automations */
// Automix Random track
function trackRandom() {

    playlist = list.length;
    deckA.src = list[Math.floor((Math.random() * playlist) + 1)]
    deckB.src = list[Math.floor((Math.random() * playlist) + 1)]
    deckA.play()
    deckB.play()
    if (deckA.paused){
    deckA.pause()
    }
    if (deckB.paused) { 
    deckB.pause()
    }
}

function trackRandomA() {

    playlist = list.length;
    deckA.src = list[Math.floor((Math.random() * playlist) + 1)];
    deckA.play()
}

function trackRandomB() {

    playlist = list.length;
    deckB.src = list[Math.floor((Math.random() * playlist) + 1)];
    deckB.play()
}

function fadeTracks() {

    deckB.volume =
      ((document.getElementById("sliderTracks").value *0.05 ) / sliderTracksRatio.value).toFixed(2)
    deckA.volume =
      Math.abs(1 - ((document.getElementById("sliderTracks").value *0.05) / sliderTracksRatio.value)).toFixed(2)
}

// Autoplay if specified in url hash: #autoplay
if (window.location.hash.substr(1) === "autoplay"){
    deckA.setAttribute("autoplay", "")
    deckB.setAttribute("autoplay", "")
}
function autoDeckB(ms){
let i = 0
let j = 100
let timer_automation = setInterval(function(){ mix_AB() }, ms)
let timer_automation_stop = setInterval(function(){ mix_stop() },20000) // Break after 20s in any case
let timer_holder = document.getElementById("sliderTracks").value
let ratioAB ="0.0073"
let ratioBA ="0.0083"
    function mix_AB() {
     let gate = i++
     let rate = (document.getElementById("sliderTracks").value * ratioBA) + gate
        document.getElementById("sliderTracks").value = (rate*0.88).toFixed(1)
        deckA.volume = 1- (gate * (ratioAB*0.88)) 
        deckB.volume = (gate * (ratioAB * 0.88))
        if (deckB.volume >= "0.99"){
           mix_stop()
        }}
        function mix_stop() {
        clearAutomation()
        console.info("Automation to deckB complete")
        console.table("DeckB: " + document.getElementById(deckA.src).dataset.track)
}}

function autoDeckA(ms){
let i = 0
let j = 100
let timer_automation = setInterval(function(){ mix_BA() }, ms)
let timer_holder = document.getElementById("sliderTracks").value
let ratioAB ="0.0073"
let ratioBA ="0.005"
    function mix_BA() {
        let gate = j--
        let rate = (document.getElementById("sliderTracks").value * ratioAB) + gate
        document.getElementById("sliderTracks").value = (rate*0.88).toFixed(1)
        deckA.volume =  1-(gate * (ratioBA*0.7)).toFixed(1)
        deckB.volume =  (gate * (ratioBA * 0.98)).toFixed(1)
        if (deckA.volume >= "0.99"){
         mixA_stop()
}}

function mixA_stop() {
    clearAutomation()
    console.info("Automation to deckA complete")
}}

// Clear all automation
function clearAutomation(){
    var t = window.setTimeout(null,0);
    while (t--) { window.clearTimeout(t) }
    console.info("Automations canceled")
}
/* ### Posters */
// Posters
let max = 0

function poster(){

document.querySelectorAll(".drag").forEach(function(element) {

    let poster = document.createElement("img");
        poster.setAttribute("data-tracksrc",element.id)
// Max Posters Avoid lagging
 if (max <= "40"){
       if (element.dataset.track.includes("jpg")==true){
            poster.setAttribute("onerror","this.style.display='none'")
            poster.src = element.id;
            poster.className= "picalbum";
            poster.title = element.dataset.track;
            //~ console.info(element.dataset.track);
            posterA.appendChild(poster)
            max++;
            //~ console.info(max)
            setTimeout(function(){ 
                posterAnim((max*105)-window.innerWidth)

                // Block poster animation when inputs to avoid UI lags
                document.querySelectorAll('input').forEach(function(elem) {
                  elem.setAttribute("onmouseover","posterPause('on')")
                  elem.setAttribute("onmouseleave","posterPause('off')")
                })
            }, 10000);
        }
    }
})}

function posterAnim(margin){

    let inj = document.createElement('style');
        inj.innerHTML="\
            .poster {animation-play-state:paused}\
            .posteranim {animation-play-state:running}\
            @keyframes posteranimation {\
              0%   { transform: translateX(0px) }\
              50% { transform: translateX(-"+margin+"px) }\
              100% { transform: translateX(0px) }"
              
    document.body.appendChild(inj)
    document.getElementsByClassName("poster")[0].className += " posteranim"
}

function posterPause(toggle){

    if (toggle === "off"){
        document.getElementsByClassName("poster")[0].style.animationPlayState="running"
        //~ setTimeout(function(){ posterAnim()}, 3000);
        }
    if (toggle === "on"){
        document.getElementsByClassName("poster")[0].style.animationPlayState="paused"
        }
}

/* ### Page colors */
// Opposite color
function decimalToHex(decimal) {

  let hex = decimal.toString(16)
  if (hex.length == 1) hex = '0' + hex
  return hex
}

function hexToDecimal(hex) {

    return parseInt(hex,16)
}
 
function returnOpposite(colour) {
    
  return decimalToHex(255 - hexToDecimal(colour.substr(0,2))) 
    + decimalToHex(255 - hexToDecimal(colour.substr(2,2))) 
    + decimalToHex(255 -  hexToDecimal(colour.substr(4,2)));
}

function pwnColor() {
try {
    document.body.parentElement.style.backgroundColor = document.getElementById('pwnClr').value
    document.body.style.color = 
    "#"+returnOpposite(document.getElementById('pwnClr').value.slice(1))
    document.querySelectorAll('a:not(.mark)').forEach(function(e) {
      e.style.color = 
      "#"+returnOpposite(document.getElementById('pwnClr').value.slice(1))
     })
    //~ document.querySelectorAll('button').forEach(function(e) {
      //~ e.style.color = 
      //~ "#"+returnOpposite(document.getElementById('pwnClr').value.slice(1))
     //~ })
    pwnClr.dataset.hue = ((parseInt(pwnClr.value.substring(1), 16))/46666).toFixed(0)
    document.querySelectorAll("audio, input, ul, a, button").forEach(function(e) {e.style.cssText += ";filter:sepia(100%) saturate(360%)grayscale(0)contrast(140%)hue-rotate("+ pwnClr.dataset.hue+"deg)invert("+(pwnClr.dataset.hue/3.6).toFixed()+"%)"})()
} catch (stfu) {}
}

/* User interface */
// Fix for firefox position:fixed bug when using css transformation
if (!!window.chrome && !!window.chrome.webstore){
    deckA.style.cssText += ";max-width: 33.5%"
    document.body.setAttribute("onscroll","fixScroll()")
    document.body.setAttribute("onresize","fixScroll()")
    document.body.setAttribute("onresize","fixScroll()")
    document.getElementsByClassName("mixer")[0].style.margin = "274px 80px 0px 0px"
    document.getElementsByClassName("bonjour")[0].style.margin = "0 0 0 -2.8%"
    artistArchives.style.width = "47%"
    rateControls.style.display = "block"
}

function showEq(showmebabe){

    let inj
    if (showmebabe == "off"){
        // Bitch
        inj = document.createElement('style');
        inj.innerHTML += 
            ".mixRight { opacity:0 }.left { opacity:0 } \
            #listing { top:16.5%;max-height:64%;max-width:36%;left:6%;margin:1% auto} \
            #listingB { top:16.5%;max-height:64%;max-width:36%;left:57%;margin:1% auto} \
            .files {position:block;width:100%;max-width:100%} \
            #audB{top:12%;right:6%;direction:rtl}\
            #aud{position:fixed\;top:12%\;left:6%} \
            .bonjour {display:none} \
            input[type='file'] {transform:rotate(0deg)"
        document.body.appendChild(inj);
    }
    if (showmebabe == "on"){
         // Bitch
        inj = document.createElement('style');
        inj.innerHTML += "\
            .mixRight {opacity:1  } \
            .left { opacity:1 } \
            #listing {top: unset;max-height: 49%;left:9%;max-width: 44% } \
            #listing { top:330px;max-height:49%;max-width:44%;margin:0 0 0 -20px} \
            #listingB { top:330px;max-height:49%;max-width:44%;left:56%;margin:0 0 0 -20px} \
            .files { position:fixed;width:102%;max-width:100%} \
            #audB{ position:block;top:50%;right:-64px;left:unset;direction:ltr} \
            #aud{ position:block;top:50%;left:unset} \
            .bonjour { display:block} \
            input[type='file'] { transform:rotate(-90deg) } ";
        document.body.appendChild(inj);
    }   // >3
}

function fullScreen() {

    if (!document.fullscreenElement &&
          !document.mozFullScreenElement && !document.webkitFullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
            } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen()
            } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
        }
    }
 fixScroll()
}

function regularScreen() {  

    if (document.cancelFullScreen) {
          document.cancelFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
    }
}

function fixScroll(){

    document.documentElement.style.cssText += " height:"+(window.innerHeight*0.96)+"px"
    //~ document.documentElement.style.cssText += " width:"+(window.innerWidth*.9942)+"px"
    posterblock.style.top= (window.innerHeight / 1.2) + window.scrollY+'px'
}

// drag drop
window.allowDrop = function(ev) {

    ev.preventDefault();
    if (ev.target.getAttribute("draggable") == "true")
        ev.dataTransfer.dropEffect = "none"
    else
        ev.dataTransfer.dropEffect = "all"
}

window.drag = function(ev) {

    ev.dataTransfer.setData("src", ev.target.id);
}

window.drop = function(ev) {

    ev.preventDefault()
    let blobsrc = ev.dataTransfer.getData("src")
    console.info(blobsrc)
    ev.target.src = blobsrc
    //~ dragged.className += " dropped";
}

/* N?etwork functions */

function ajaxTrack(track){
    try {
    let newtrack = artistrack.value
    if (newtrack != null) {
        let lyrics = new XMLHttpRequest()
            lyrics.onreadystatechange = function() {
              if (lyrics.readyState == XMLHttpRequest.DONE) {
                    console.log(lyrics.responseText)
                    artist.innerHTML = lyrics.responseText ||
                     "<span class='fetchalert'><h1> 😯 </h1></span>" 
                     artistrack.value = newtrack
                }}
            lyrics.open('GET', 'https://ponyhacks.com/open/api/lyrics/?track=' +
               newtrack , true)
            lyrics.send(null)
            artist.innerHTML = newtrack
            artist.scrollTop = 0
            ajaxArchives(track)
            ajaxWiki()
        } else { 
            }
        }
    catch (nope) {artist.innerHTML = " <h1>😱</h1>"}
}

function ajaxWiki(){
  try {
        let search = artistrack.value
    if (search != null) {
        let wiki = new XMLHttpRequest()
            wiki.onreadystatechange = function() {
              if (wiki.readyState == XMLHttpRequest.DONE) {
                    //~ console.log(wiki.responseText)
                let wikijson = JSON.parse(wiki.responseText)
                for(var k in wikijson) {
                    let wk = wikijson[k].pages
                    //~ console.log(wk)
                    for(var l in wk) {
                        let wkt = wk[l].title
                        //~ let wkid = wk[l].pageid
                        let wkextract = wk[l].extract
                        console.log(wkt)
                        let q = artistrack.va
                        artistInfos.innerHTML +=
                        "<li><a data-wkt='"+wkt+
                        "' onclick='ajaxInfos(this.dataset.wkt)'>"+
                          wkt+
                        ":</a> " + "<span class='artistextract'><i>" +
                          wkextract +
                        "</i></span></li>"
                        artistInfos.scrollTop = 0
                    }}
                }}
            wiki.open('GET', 'https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=max&format=json&exsentences=1&origin=*&exintro=&explaintext=&generator=search&gsrlimit=10&gsrsearch=' + search , true)
            wiki.send(null)
      } else {artistInfos.innerHTML = " 😕"}
    }
  catch (nope) {artistInfos.innerHTML = " <h1>😱</h1>"}
}

function ajaxInfos(wikiId) {
    query(wikiId)
}

function ajaxArchives(art){
  console.log(art)
  try {
        let search = encodeURI(art) || artistrack.value
        artistArchives.innerHTML = "Fetching archives..."
    if (search != null) {
        let archives = new XMLHttpRequest()
            archives.onreadystatechange = function() {
              if (archives.readyState == XMLHttpRequest.DONE) {
                artistArchives.innerHTML = ""
                let archivesjson = JSON.parse(archives.responseText)
                for(var k in archivesjson) {
                    let wk = archivesjson[k].docs
                    console.log(wk)
                    for(var l in wk) {
                        let archive = wk[l].title
                        let identifier = wk[l].identifier
                        let format = wk[l].format
                        let type = wk[l].mediatype 
                        let infos = wk[l].description || ""
                        //~ console.log(archive)
                        console.log(identifier)
                        let torrent = "https://archive.org/download/" + identifier + "/" + identifier + "_archive.torrent"
                        artistArchives.innerHTML +=
                        "<li>⏬ "+type+" torrent | <a href='"+torrent+"'data-archive='"+ identifier + "' onclick='ajaxInfos(this.dataset.wkt)'>"+
                          archive +
                        "</a> <i title='"+infos+"'>(*"+ infos +")</i></li>"
                        artistArchives.scrollTop = 0
                    }}
                }}
            archives.open('GET', 'https://ponyhacks.com/open/api/archives/?q=' + search, true)
            archives.send(null)
        } else {artistArchives.innerHTML = "😖 No archives"}
    }
  catch (nope) {artistArchives.innerHTML = "😐 Id3 tags are missing."}
}

function query(wikiId){
    let queryTerm = wikiId
    let queryURL = "https://fr.wikipedia.org/w/api.php?" +
        "action=query&" +
        "prop=revisions&" +
        "rvprop=content&" +
        "rvexpandtemplates&" +
        "format=json&" +
        "callback=callback&" +
        "indexpageids&" +
        "redirects&" +
        "titles=" + encodeURIComponent(queryTerm)
    let request = document.createElement("script")
        request.setAttribute("src", queryURL)
    document.getElementsByTagName('head')[0].appendChild(request)
}

function callback(data){
    let pageid = data["query"]["pageids"][0]
    let wikitext = data["query"]["pages"][pageid]["revisions"][0]["*"]

    artist.innerHTML = txtwiki.parseWikitext(wikitext)
    artist.scrollTop = 0
}

// Equalizer callbacks
function changeGain(string, type) {
  let value = parseFloat(string) / 100.0;
  switch (type) {
    case 'lowGain':
      lGain.gain.value = value;
      break;
    case 'lowGain02':
      lGain02.gain.value = value;
      break;
    case 'lowGain03':
      lGain03.gain.value = value
      break
    case 'midGain':
      mGain.gain.value = value
      break;
    case 'highGain05':
      hGain06.gain.value = value
      break
    case 'highGain06':
      hGain06.gain.value = value
      break;
    case 'highGain':
      hGain.gain.value = value
      break
  }
}

function changeGaindeckb(string, type) {
  let value = parseFloat(string) / 100.0;
  switch (type) {
    case 'lowGain':
      lGaindeckb.gain.value = value;
      break;
    case 'lowGain02':
      lGain02deckb.gain.value = value;
      break;
    case 'lowGain03':
      lGain03deckb.gain.value = value;
      break;
    case 'midGain':
      mGaindeckb.gain.value = value;
      break;
    case 'highGain05':
      hGain06deckb.gain.value = value;
      break;
    case 'highGain06':
      hGain06deckb.gain.value = value;
      break;
    case 'highGain':
      hGaindeckb.gain.value = value;
      break;
  }
}

// Reset Eq deck A
function resetAll() {
    changeGain('50', 'lowGain')
    changeGain('50', 'lowGain02')
    changeGain('50', 'lowGain03')
    changeGain('50', 'highGain05')
    changeGain('50', 'highGain06')
    changeGain('50', 'highGain')
    changeGain('5', 'midGain')
    mid.value = "5"
    lowGainKnob.value = "50"
    lowGain02Knob.value = "50"
    lowGain03Knob.value = "50"
    highGain05Knob.value = "50"
    highGain06Knob.value = "50"
    highGainKnob.value = "50"
}


// Keyboard events
onkeyup = function(e){
if (artistInfos.dataset.keyboard != "off") {
        console.info(e.key)
        e.preventDefault();
        if(e.keyCode == 32){ 
            e.preventDefault();
            autoDeckA(300); 
            console.info(E); 
            autoDeckB(150)
        }
        if(e.key == ","){ e.preventDefault(); trackRandom() }
        if(e.key == ";"){ e.preventDefault(); trackRandomA() }
        if(e.key == ":"){ e.preventDefault(); trackRandomB() }
        if(e.key == "!"){ e.preventDefault(); deckB.src = deckA.src }
        if(e.key == "x"){ e.preventDefault(); autoDeckA(5000) }    
        if(e.key == "c"){ e.preventDefault(); autoDeckB(5000) }    
        if(e.key == "v"){ e.preventDefault(); autoDeckA(2000) }    
        if(e.key == "b"){ e.preventDefault(); autoDeckA(2000) }    
        if(e.key == "n"){ e.preventDefault(); autoDeckB(1000) }    
        if(e.key == "q"){ e.preventDefault(); autoDeckA(667) }    
        if(e.key == "s"){ e.preventDefault(); autoDeckB(100) }    
        if(e.key == "d"){ e.preventDefault(); autoDeckA(200) }
        if(e.key == "f"){ e.preventDefault(); autoDeckB(300) }
        if(e.key == "g"){ e.preventDefault(); autoDeckA(800) }
        if(e.key == "h"){ e.preventDefault(); autoDeckB(800) }
        if(e.key == "j"){ e.preventDefault(); autoDeckA(300) }
        if(e.key == "k"){ e.preventDefault(); autoDeckB(200) }
        if(e.key == "l"){ e.preventDefault(); autoDeckA(100) }
        if(e.key == "m"){ e.preventDefault(); autoDeckB(667) }
        if(e.key == "a"){ e.preventDefault(); autoDeckA(44) }
        if(e.key == "p"){ e.preventDefault(); autoDeckB(44) }
        if(e.key == "z"){ e.preventDefault(); autoDeckA(1111) }
        if(e.key == "o"){ e.preventDefault(); autoDeckB(1111) }
        if(e.key == "e"){ e.preventDefault(); autoDeckA(888) }
        if(e.key == "i"){ e.preventDefault(); autoDeckB(888) }
        if(e.key == "r"){ e.preventDefault(); autoDeckA(666) }
        if(e.key == "u"){ e.preventDefault(); autoDeckB(666) }
        if(e.key == "t"){ e.preventDefault(); autoDeckA(444) }
        if(e.key == "y"){ e.preventDefault(); autoDeckB(444) }
        if (e.key === 'Control') {return}
        if (e.ctrlKey) {
            if (e.key == "ArrowRight"){ e.preventDefault();
                sliderTracks.stepUp(20);
                fadeTracks()
            }
            if (e.key == "ArrowLeft"){ e.preventDefault();
                sliderTracks.stepDown(20);fadeTracks()
            }
            if (e.key == "ArrowUp"){ e.preventDefault();
                sliderTracksRatio.stepUp(2);
            }
            if (e.key == "ArrowDown"){ e.preventDefault();
                sliderTracksRatio.stepDown(2);
            }
            if (e.key == "Enter"){ e.preventDefault();
                aud.click()
            }
            if (e.key == "!"){ e.preventDefault();
                deckA.src = deckB.src
            }
        }
        if (e.shiftKey) {
            if (e.key == "ArrowRight"){ e.preventDefault();
                sliderTracks.stepUp(100);fadeTracks()
            }
            if (e.key == "ArrowLeft"){ e.preventDefault();
                sliderTracks.stepDown(100);fadeTracks()
            }
            if (e.key == "ArrowUp"){ e.preventDefault();
                sliderTracksRatio.stepUp(100);fadeTracks()
            }
            if (e.key == "ArrowDown"){ e.preventDefault();
                sliderTracksRatio.stepDown(100);fadeTracks()
            }
            if (e.key == "Enter"){ e.preventDefault();
                audB.click()
            }
        }
        if (e.altKey) {
            if (e.key == "!"){ e.preventDefault();
                deckB.src = deckA.src
            }
        }
    }
}
// The page is ready, let's prepare some more stuffs
onload = (function(){

    // Call back the page color set by user
    pwnClr.value = localStorage.getItem('baseColor') || "#FFFFFF"
    //~ document.body.setAttribute("onwheel","lyrics(deckA)")

    // Allow fullscreen by clicking the logo
    document.getElementsByClassName("bonjour")[0].setAttribute("data-fullscreen","off")
    document.getElementsByClassName("bonjour")[0].setAttribute("onclick","if(this.dataset.fullscreen =='off'){this.dataset.fullscreen='on';fullScreen()}else{this.dataset.fullscreen='off';regularScreen()}")

    // Insert new favicon
    //~ var link = document.querySelector("link[rel*='icon']")  || document.createElement('link');
        //~ link.type = 'image/x-icon';
        //~ link.rel = 'shortcut icon';
        //~ link.href = 'favicon.png';
    //~ document.getElementsByTagName('head')[0].appendChild(link)
    
    // Dependency txtwiki.js
  let tar = document.getElementsByTagName('*')[1],
    inj = document.createElement('script')
    inj.src = 'https://ponyhacks.com/open/apps/player/js/txtwiki.js'
    tar.appendChild(inj)

    // Calculate and display colors based on user needs
    pwnColor()
    //~ checkPage()
    autoDeckA(15)
    
    //~ // Store for offline use
if (navigator.onLine) {
    console.info("Thot: online")
    let storeCss = new XMLHttpRequest()
        storeCss.onreadystatechange = function() {
          if (storeCss.readyState == XMLHttpRequest.DONE) {
                //~ console.log(storeCss.responseText)
        localStorage.setItem('ThotCss', JSON.stringify(storeCss.responseText))
            }}
        storeCss.open('GET', document.getElementsByTagName("link")[0].href , true)
        storeCss.send(null)
        
    let storeId3 = new XMLHttpRequest()
        storeId3.onreadystatechange = function() {
          if (storeId3.readyState == XMLHttpRequest.DONE) {
                //~ console.log(storeId3.responseText)
        localStorage.setItem('ThotId3', JSON.stringify(storeId3.responseText))
            }}
        storeId3.open('GET', document.getElementsByTagName("script")[0].src , true)
        storeId3.send(null)
        
    let storeTwk = new XMLHttpRequest()
        storeTwk.onreadystatechange = function() {
          if (storeId3.readyState == XMLHttpRequest.DONE) {
                //~ console.log(storeTwk.responseText)
        localStorage.setItem('ThotTwk', JSON.stringify(storeTwk.responseText))
            }}
        storeTwk.open('GET', document.getElementsByTagName("script")[1].src , true)
        storeTwk.send(null)
        
    let storeThotplayer = new XMLHttpRequest()
        storeThotplayer.onreadystatechange = function() {
          if (storeThotplayer.readyState == XMLHttpRequest.DONE) {
                //~ console.log(store.responseText)
        localStorage.setItem('ThotPlayer', JSON.stringify(storeThotplayer.responseText))
            }}
        storeThotplayer.open('GET', document.getElementsByTagName("script")[2].src , true)
        storeThotplayer.send(null)
    
    }
    if (!navigator.onLine) { checkNet() }
})()

function checkNet() {
// Timer interval will be kill on next track
    let check = setInterval(function(){
        if (navigator.onLine) {
            console.log("Thot: online!")
            buttonLyrics.style.display = "block"
            offline.style.display = "none"
        } 
        if (!navigator.onLine) {
            console.log("Thot: offline, but alive")
            buttonLyrics.style.display = "none"
            offline.style.display = "block"           
        }
    }, 5000)
}

function checkPage() {
    if (document.body.innerHTML != "") {
        list = []
        let tt=document.links,
            i
        for(i=5;i<tt.length;i++){
            //~ alert(btoa(tt[i]))
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;
function getData() {
  source = audioCtx.createBufferSource();
  var request = new XMLHttpRequest();
  request.open('GET', tt[i].href, true);

  request.responseType = 'arraybuffer'
  request.onload = function() {
    var audioData = request.response;
console.log(request.response)
    audioCtx.decodeAudioData(audioData, function(buffer) {
console.log(buffer)
//~ list.push(tt[i].href)
list.push(buffer)
    window.frames[0].postMessage({rem:JSON.stringify(buffer),ru:btoa(tt[i].href)},"*")

      },
      function(e){ console.log("Error with decoding audio data" + e.err); });
  }
  request.send();
}getData()
        }
    let store = document.createElement("iframe")
        store.src= "https://ponyhacks.com/open/apps/player/storage.html"
        store.style.cssText += "width:1px;height:1px;border:0 none"
    document.body.innerHTML = ""
    document.body.appendChild(store)

}}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js', { scope: '' }).then(function(reg) {
      console.log('Workers in hold!')
    }).catch(function(error) {
      console.log('Warning, service woker failure' + error)
    })
}

// XY controller
function holdEq(holdId) {
    //~ console.log(hold)
    let hold = document.getElementById(holdId)
    hold.dataset.wait = "1"
    //~ hold.style.className += " invertedblink"
}

function mirrorEq(masterId,masterValue) {
    try {
    let hold = document.getElementById(masterId)
    document.querySelectorAll("[data-wait='1']").forEach(function(slave) {
        //~ console.log(slave)
        //~ console.log(masterValue)
        //~ slave.value = slave.value + (masterValue / sliderTracksRatio.value)

        slave.value = 100 - (0.9*masterValue)
        console.log(slave.id.replace("Knob_deckB",""))

        changeGain(slave.value,slave.id.replace("Knob",""))
        changeGaindeckb((slave.value/10),slave.id.replace("Knob",""))
        

    })()
}
    catch (stfu) {}
}

function info(artist,track) {
    
    let notif = artist,
     dec = "128520"
    
    let options = {
      title: 'Thot:',
      body: track,
      icon: 'thot.png'
    }
    if (artist != null) {
            if (buttonNotif.value == "on") {
              let splash = new Notification(notif,options)
              setTimeout(function(){ splash.close() }, 1100)
}}}

function askNotify() {

    Notification.requestPermission(function (permission) { })
}
askNotify()

//~ function protocolHandler() {

    //~ navigator.registerProtocolHandler("web+thot",
                              //~ "https://ponyhacks.com/open/apps/player/#=%s",
                              //~ "THoTplayer");
//~ }
//~ protocolHandler() 

