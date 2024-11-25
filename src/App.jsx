import { useState } from "react";
import React from "react";
import "./App.css";

class DrumMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayText: "",
      volume: 1,
      powerBtn: true,
      switchBtn: true,
    };
    this.updateDisplay = this.updateDisplay.bind(this);
    this.updateVolume = this.updateVolume.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick = (e) => {
    /*prettier-ignore*/
    if(e.target.id === "powerBtn" || e.target.parentElement.id === "powerBtn"){
      const button = document.getElementById('powerBtn');
      this.setState({powerBtn: !this.state.powerBtn, displayText: this.state.powerBtn ? "" : "Power: ON"}, ()=>{
        this.state.powerBtn ?
        button.classList.replace('end', 'baseline') :
        button.classList.replace('baseline', 'end');
      });
    }
    else{
      const button = document.getElementById('switchBtn');
      this.setState({switchBtn: !this.state.switchBtn, displayText: this.state.switchBtn ? "Piano kit" : "Heater kit"}, ()=>{
        this.state.switchBtn ?
        button.classList.replace('end', 'baseline') :
        button.classList.replace('baseline', 'end');
      });
    }
  };
  updateDisplay(text) {
    this.setState({
      displayText: text,
    });
  }
  updateVolume = (e) => {
    const newVolume = parseFloat(e.target.value) / 100;
    if (!isNaN(newVolume) && newVolume >= 0 && newVolume <= 1) {
      this.setState({ volume: newVolume }, () => {
        const displayText = `Volume: ${parseInt(this.state.volume * 100)}%`;
        this.updateDisplay(displayText);
      });
    }
  };
  componentDidUpdate(prevState) {
    if (!this.state.powerBtn) {
      document.querySelector("#volIcon").className = "bi bi-volume-mute";
    } else if (this.state.volume !== prevState.volume) {
      const volumeIcon = document.querySelector("#volIcon");
      this.state.volume > 0.5
        ? (volumeIcon.className = "bi bi-volume-up")
        : this.state.volume > 0
        ? (volumeIcon.className = "bi bi-volume-down")
        : (volumeIcon.className = "bi bi-volume-mute");
    }
  }
  render() {
    return (
      <main id="drum-machine">
        <Drums
          displayFunc={this.updateDisplay}
          vol={this.state.volume}
          powerBtn={this.state.powerBtn}
          switchBtn={this.state.switchBtn}
        />
        <section className="displaySection">
          <section className="buttonSection">
            <span>
              Power:
              {/*prettier-ignore*/}
              <div id="powerBtn" className="outerBtn baseline" onClick={this.handleClick}>
                <div className="innerBtn"></div>
              </div>
            </span>
            <span>
              Bank:
              {/*prettier-ignore*/}
              <div id="switchBtn" className="outerBtn baseline" onClick={this.state.powerBtn ? this.handleClick : null}>
                <div className="innerBtn"></div>
              </div>
            </span>
          </section>
          <div id="display">{this.state.displayText}</div>
          <div className="volumeDiv">
            {/*prettier-ignore*/}
            <i className="bi bi-volume-up" id="volIcon" style={{fontSize: "20px", marginRight: "5px"}}></i>
            <input
              type="range"
              min={0}
              max={100}
              value={this.state.powerBtn ? this.state.volume * 100 : 0}
              id="volumeBar"
              onChange={this.updateVolume}
              disabled={!this.state.powerBtn}
            />
          </div>
        </section>
        <section className="tabletTop">
          <div className="camera">
            <div className="innerCamera"></div>
          </div>
        </section>
      </main>
    );
  }
}

class Drums extends React.Component {
  constructor(props) {
    super(props);
    this.activeKeys = new Set();
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.onOffFunc = this.onOffFunc.bind(this);
    this.switchFunc = this.switchFunc.bind(this);
  }
  //prettier-ignore
  componentDidMount() {
    if(this.props.powerBtn){
      document.querySelector("body").addEventListener("keydown", this.handleKeyDown);
      document.querySelector("body").addEventListener("keyup", this.handleKeyUp);
      document.querySelector("#drumsSection").addEventListener("click", this.handleClick);
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.vol !== prevProps.vol) {
      const audioElements = document.querySelectorAll(".clip");
      audioElements.forEach((audio) => (audio.volume = this.props.vol));
    }
    if (this.props.powerBtn !== prevProps.powerBtn) {
      this.onOffFunc();
    }
    if (this.props.switchBtn !== prevProps.switchBtn) {
      this.switchFunc();
    }
  }
  onOffFunc() {
    //prettier-ignore
    if(!this.props.powerBtn){
      document.querySelector("body").removeEventListener("keydown", this.handleKeyDown);
      document.querySelector("body").removeEventListener("keyup", this.handleKeyUp);
      document.querySelector("#drumsSection").removeEventListener("click", this.handleClick);
      let drums = document.getElementsByClassName('drum-pad');
      drums = [...drums];
      drums.forEach((drum) => {
        drum.classList.remove('drum-hover');
      });
      document.getElementById('display').textContent="";
    }
    else{
      document.querySelector("body").addEventListener("keydown", this.handleKeyDown);
      document.querySelector("body").addEventListener("keyup", this.handleKeyUp);
      document.querySelector("#drumsSection").addEventListener("click", this.handleClick);
      let drums = document.getElementsByClassName('drum-pad');
      drums = [...drums];
      drums.forEach((drum) => {
        drum.classList.add('drum-hover');
      });
    }
  }
  switchFunc() {
    if (!this.props.switchBtn) {
    } else {
    }
  }
  handleClick(event) {
    const drumPad = event.target;
    if (drumPad.classList.contains("drum-pad")) {
      this.props.displayFunc(drumPad.id);
      drumPad.querySelector("audio").pause();
      drumPad.querySelector("audio").currentTime = 0;
      drumPad.querySelector("audio").play();
    }
  }
  handleKeyDown = (event) => {
    const drumPadAudio = document.querySelector(`#${event.key.toUpperCase()}`);
    if (drumPadAudio && !this.activeKeys.has(event.key)) {
      this.activeKeys.add(event.key);
      drumPadAudio.parentElement.classList.add("active");
      this.props.displayFunc(drumPadAudio.parentElement.id);
      drumPadAudio.pause();
      drumPadAudio.currentTime = 0;
      drumPadAudio.play();
    }
  };
  handleKeyUp = (event) => {
    const drumPadAudio = document.querySelector(`#${event.key.toUpperCase()}`);
    if (drumPadAudio) {
      this.activeKeys.delete(event.key);
      drumPadAudio.parentElement.classList.remove("active");
    }
  };
  render() {
    return this.props.switchBtn ? drumSet1 : drumSet2;
  }
}

const drumSet1 = (
  <section className="drums" id="drumsSection">
    <div id="Heater-1" className="drum-pad drum-hover">
      <audio src="/src/assets/Heater-1.mp3" className="clip" id="Q"></audio>Q
    </div>
    <div id="Heater-2" className="drum-pad drum-hover">
      <audio src="/src/assets/Heater-2.mp3" className="clip" id="W"></audio>W
    </div>
    <div id="Heater-3" className="drum-pad drum-hover">
      <audio src="/src/assets/Heater-3.mp3" className="clip" id="E"></audio>E
    </div>
    <div id="Heater-4" className="drum-pad drum-hover">
      <audio src="/src/assets/Heater-4.mp3" className="clip" id="A"></audio>A
    </div>
    <div id="Heater-6" className="drum-pad drum-hover">
      <audio src="/src/assets/Heater-6.mp3" className="clip" id="S"></audio>S
    </div>
    <div id="Dsc_Oh" className="drum-pad drum-hover">
      <audio src="/src/assets/Dsc_Oh.mp3" className="clip" id="D"></audio>D
    </div>
    <div id="Kick_n_Hat" className="drum-pad drum-hover">
      <audio src="/src/assets/Kick_n_Hat.mp3" className="clip" id="Z"></audio>Z
    </div>
    <div id="RP4_KICK_1" className="drum-pad drum-hover">
      <audio src="/src/assets/RP4_KICK_1.mp3" className="clip" id="X"></audio>X
    </div>
    <div id="Cev_H2" className="drum-pad drum-hover">
      <audio src="/src/assets/Cev_H2.mp3" className="clip" id="C"></audio>C
    </div>
  </section>
);

const drumSet2 =
  //prettier-ignore
  <section className="drums" id="drumsSection">
    <div id="Chord-1" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/Chord_1.mp3" className="clip" id="q"></audio>Q
    </div>
    <div id="Chord-2" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/Chord_2.mp3" className="clip" id="w"></audio>W
    </div>
    <div id="Chord-3" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/Chord_3.mp3" className="clip" id="e"></audio>E
    </div>
    <div id="Shaker" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3" className="clip" id="a"></audio>A
    </div>
    <div id="Open-HH" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/Dry_Ohh.mp3" className="clip" id="s"></audio>S
    </div>
    <div id="Closed-HH" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/Bld_H1.mp3" className="clip" id="d"></audio>D
    </div>
    <div id="Punchy-kick" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/punchy_kick_1.mp3" className="clip" id="z"></audio>Z
    </div>
    <div id="Side-Stick" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/side_stick_1.mp3" className="clip" id="x"></audio>X
    </div>
    <div id="Snare" className="drum-pad drum-hover">
      <audio src="https://s3.amazonaws.com/freecodecamp/drums/Brk_Snr.mp3" className="clip" id="c"></audio>C
    </div>
  </section>;

export default DrumMachine;
