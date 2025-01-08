export const WEBGL = {
  isWebGLAvailable: function () {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  },

  isWebGL2Available: function () {
    try {
      const canvas = document.createElement("canvas");
      return !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
    } catch (e) {
      return false;
    }
  },

  getWebGLErrorMessage: function () {
    const message = document.createElement("div");
    message.id = "webglmessage";
    message.style.fontFamily = "monospace";
    message.style.fontSize = "13px";
    message.style.textAlign = "center";
    message.style.background = "#fff";
    message.style.color = "#000";
    message.style.padding = "1em";
    message.style.width = "400px";
    message.style.margin = "5em auto 0";

    if (!this.isWebGLAvailable()) {
      message.innerHTML = window.WebGLRenderingContext
        ? 'Your graphics card does not support WebGL.<br>Find out how to get it <a href="https://get.webgl.org/" target="_blank">here</a>.'
        : 'Your browser does not support WebGL.<br>Find out how to get it <a href="https://get.webgl.org/" target="_blank">here</a>.';
    }

    return message;
  },

  getWebGL2ErrorMessage: function () {
    const message = document.createElement("div");
    message.id = "webglmessage";
    message.style.fontFamily = "monospace";
    message.style.fontSize = "13px";
    message.style.textAlign = "center";
    message.style.background = "#fff";
    message.style.color = "#000";
    message.style.padding = "1em";
    message.style.width = "400px";
    message.style.margin = "5em auto 0";

    if (!this.isWebGL2Available()) {
      message.innerHTML =
        'Your graphics card does not support WebGL2.<br>Find out how to get it <a href="https://get.webgl.org/webgl2/" target="_blank">here</a>.';
    }

    return message;
  },
};
