(function () {
  function generateT(n = 100) {
  return Array.from({ length: n }, (_, i) => i / (n - 1));
}
  const t = generateT();

function inBack(x, s = 1.70158) {
  return (s + 1) * x * x * x - s * x * x;
}

  function inBounce(t) {
    function bounceOut(x) {
      if (x < 1 / 2.75) return 7.5625 * x * x;
      else if (x < 2 / 2.75) {
        x -= 1.5 / 2.75;
        return 7.5625 * x * x + 0.75;
      } else if (x < 2.5 / 2.75) {
        x -= 2.25 / 2.75;
        return 7.5625 * x * x + 0.9375;
      } else {
        x -= 2.625 / 2.75;
        return 7.5625 * x * x + 0.984375;
      }
    }
    return 1 - bounceOut(1 - t);
  }

  function InCircle(t) {
  return 1 - Math.sqrt(1 - t * t);
  }

  function InCubic(t) {
  return t * t * t;
}
function InElastic(t) {
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * ((2 * Math.PI) / 3));
}
function InExpo(t) {
  return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
}
function InOutBack(t, s = 1.70158) {
  s *= 1.525;
  if (t < 0.5) {
    return (Math.pow(2 * t, 2) * ((s + 1) * 2 * t - s)) / 2;
  } else {
    return (Math.pow(2 * t - 2, 2) * ((s + 1) * (t * 2 - 2) + s) + 2) / 2;
  }
}

function InOutBounce(t) {
  return t < 0.5
    ? (1 - bounceOut(1 - 2 * t)) / 2
    : (1 + bounceOut(2 * t - 1)) / 2;
}

function InOutCirc(t) {
  return t < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
}



      function bounceOut(t) {
        const n1 = 7.5625, d1 = 2.75;
        if (t < 1 / d1) return n1 * t * t;
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }

  function InOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  
  function InOutElastic(t) {
  return t === 0 ? 0 : t === 1 ? 1 :
          t < 0.5
            ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5))) / 2
            : Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * ((2 * Math.PI) / 4.5)) / 2 + 1
  }
  
function InOutExpo(t) {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5
    ? Math.pow(2, 20 * t - 10) / 2
    : (2 - Math.pow(2, -20 * t + 10)) / 2;
}



  function buildChart(canvasId, label, data, color, yMin = -1, yMax = 1) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: t,
      datasets: [
        {
          label,
          data,
          borderColor: color,
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      tension: 0,
      spanGaps: true,
      scales: {
        x: {
          title: { display: true, text: "Progress (t)" },
          min: 0,
          max: 1,
        },
        y: {
          title: { display: true, text: "Value" },
          min: yMin,
          max: yMax,
        },
      },
    },
  });
}


 

  window.renderInBackChart = function () {
    buildChart("inBackChart", "InBack", t.map(inBack), "teal", -10, 1.5);
  };

  window.renderLinearChart = function () {
    buildChart("linearChart", "Linear", t, "White", 0, 1);
  };

  window.renderInBounceChart = function () {
    buildChart("inBounceChart", "InBounce", t.map(inBounce), "purple", 0, 1.1);
  };

  window.renderInCircleChart = function () {
    buildChart("inCircleChart", "InCircle", t.map(InCircle), "blue", 0, 1);
  };
   window.renderInCubicChart = function () {
    buildChart("inCubicChart", "InCubic", t.map(InCubic), "yellow", 0, 1);
  };
   window.renderInElasticChart = function () {
    buildChart("inElasticChart", "InElastic", t.map(InElastic), "red", -0.4, 1);
  };
  window.renderInExpoChart = function () {
    buildChart("inExpoChart", "InExpo", t.map(InExpo), "orange", 0, 1);
  };
  window.renderInOutBackChart = function () {
    buildChart("inOutBackChart", "InOutBack", t.map(InOutBack), "green", -4, 8.6);
  };
  window.renderInOutBounceChart = function () {
    buildChart("inOutBounceChart", "InOutBounce", t.map(InOutBounce), "pink", 0, 1);
  };
  window.renderBounceOutChart = function () {
    buildChart("bounceOutChart", "BounceOut", t.map(bounceOut), "gray", 0, 1);
  };
  window.renderInOutCircChart = function () {
    buildChart("inOutCircChart", "InOutCirc", t.map(InOutCirc), "teal", 0, 1);
  };
  window.renderInOutCubicChart = function () {
    buildChart("inOutCubicChart", "InOutCubic", t.map(InOutCubic), "purple", 0, 1);
  };
  window.renderInOutElasticChart = function () {
    buildChart("inOutElasticChart", "InOutElastic", t.map(InOutElastic), "blue", -0.2, 1.2);
  };
  window.renderInOutExpoChart = function () {
    buildChart("inOutExpoChart", "InOutExpo", t.map(InOutExpo), "yellow", 0, 1);
  };

})();
