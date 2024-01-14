# SolarOven

This project represents a solar oven project in a threejs environment. The oven was modelized on fusion 360 and imported using GLTFLoader. Having some problems with the materials import, 
they were partially manually redone using conditional logic to detect the components parts'name and assigning different material parameters.
The Grass texture was obtained on a small project by Paul West (https://jsfiddle.net/prisoner849/n1emstwd/). The sun texture was obtained using a real sun HDRI photo, a shader and by applying a bloom
effect in post processing to the whole scene but using specific parameters to mainly limit its effect to the rotating sun. 
Using the raycaster function, specific text is displayed at the bottom left corner depending on the components clicked by the user (Sun, mirro panels and oven).
