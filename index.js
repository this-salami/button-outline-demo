/* 
animate functions from: https://javascript.info/js-animation#timing-functions

arc functions: from https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
*/
function animate({timing, draw, duration}) {
  let start = performance.now();
  requestAnimationFrame(function animate(time) {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    let progress = timing(timeFraction)

    draw(progress); // draw it

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }

  });
}

function makeEaseInOut(timing) {
  return function(timeFraction) {
    if (timeFraction < .5)
      return timing(2 * timeFraction) / 2;
    else
      return (2 - timing(2 * (1 - timeFraction))) / 2;
  }
}

function quad(timeFraction) {
  return Math.pow(timeFraction, 2)
}

const quadEaseInOut = makeEaseInOut(quad);

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "L", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;       
}

let elems = document.querySelectorAll(".specialOutline");
for (let i = 0; i < elems.length; i++){
    let elem = elems[i];
    
    let degAmount = 0;
    let duration = 100;
    let timingFunc = quadEaseInOut;
    elem.addEventListener("mouseenter", e => {
        let boundingBox = elem.getBoundingClientRect();
        let mousex = e.clientX - boundingBox.left - boundingBox.width/2;
        let mousey = e.clientY - boundingBox.top - boundingBox.height/2;
        let startDeg = Math.atan2(mousey, mousex) * 180/Math.PI + 90;
        
        let x = boundingBox.width/2;
        let y = boundingBox.height/2;
        let radius = Math.sqrt(Math.pow(x + 4, 2) + Math.pow(y + 4, 2));
        
        animate({
            duration: duration,
            timing: timingFunc,
            draw: function(progress){
                degAmount = 180 * progress;
                if (degAmount >= 178){
                    elem.style.setProperty('--clip-path', `""`);
                    return;
                }
                let d = describeArc(x, y, radius, startDeg - degAmount, startDeg + degAmount);
                elem.style.setProperty('--clip-path', `"M ${x} ${y} ${d} Z"`);
            }
        });
    });
    elem.addEventListener("mouseleave", e => {
        let boundingBox = elem.getBoundingClientRect();
        let mousex = e.clientX - boundingBox.left - boundingBox.width/2;
        let mousey = e.clientY - boundingBox.top - boundingBox.height/2;
        let startDeg = Math.atan2(mousey, mousex) * 180/Math.PI + 90;
        
        let x = boundingBox.width/2;
        let y = boundingBox.height/2;
        let radius = Math.sqrt(Math.pow(x + 4, 2) + Math.pow(y + 4, 2));
        
        let initdeg = degAmount
        animate({
            duration: duration,
            timing: timingFunc,
            draw: function(progress){
                degAmount = initdeg * (1 - progress);
                let d = describeArc(x, y, radius, startDeg - degAmount, startDeg + degAmount);
                elem.style.setProperty('--clip-path', `"M ${x} ${y} ${d} Z"`);
            }
        });
    });
}
