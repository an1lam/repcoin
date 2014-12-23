# Heroku
## Deploying
**Process**
Make sure you are on our 'master' branch on your local git repository.  
To deploy, run `git push heroku master` (I've detailed the meaning and
results of this command below).

**Commands**
`git push heroku master` - Pushes your local 'master' branch to the
heroku remote. This will initiate a rebuild of the Heroku server. If you
wish to stop the build, you can simply hit 'Ctrl-C'. However, make sure
you do this before you reach the part of the build where the log text
says 'Launching...'. At that point in the build, bad things will happen
if you attempt to kill it.  

`heroku logs` - Fetches the logs for our 'quiet-spire-2804' heroku box.
The Heroku logs display build results, deploys, and site-killing errors.

## References
[Heroku Dev Center Git Deployment Documentation](https://devcenter.heroku.com/articles/git)  

## Todos
* Set up a second box to use as our 'staging' environment.
* Add an analytics tool to our Heroku box.
