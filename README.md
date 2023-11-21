# Overview

See tutorial-wiki-fe for more information.

## TODO:
- Add param validation to endpoints and remove unnessesary and unmeaningful fields from JSON.
- Add input sanitization.
- Add top level parent functionality. This will let a user navigate to the original tutorial from which an embedded section may have been taken from.
- Allow a tutorial to only be edited by a rootId that corresponds to the tutorial or its top level parent.
- Add a tutorial name field that can be used as a URL parameter.
- Roll back db changes if a problem occurs. This could be done with a draft tutorial table.
