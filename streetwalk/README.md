Version with just 1 pano in offscreen playing on a loop - testing if jaggies still there
Result: No jaggies in 11.4, but jaggies in 11.3, so worker listener causing the jaggies
Thoughts:

1. Can we time when the worker listner returns ?
2. Main thread to be engaged ?

Next tests:
Just change Canvas textures without worker listener, see if issue persists
