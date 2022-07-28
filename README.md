# TheWashAPI

### For wendale
In order for you to use the API, use the following endpoints (too lazy to compile swagger, i'm exhausted and i wanna jump back in to game development)

for the anime:
- /api//v2/search-anime
  - POST METHOD
```json
{
  search: String
}
```
- /api/v2/load-anime/:link
  - GET METHOD
  - returns the episodes (it assumes everything is seasonal regardless of the show)
  - append the returned link from from the endpoint above
`Do you really need an example for this?`

- /api/v2/play-anime
  - POST METHOD
  - returns the m3u8
```json
{
  link: String (duhhh)
}
```

for the movies, same shit as above but with a few changes
- /v2/search-flick
  - POST METHOD
  - blah blah blah blah
```json
{
  search: String
}
```
- /api/v2/load-flick/movie/:link
  - GET METHOD
  - returns the m3u8 or the mp4, parse accordingly
  - keep in mind that the string `/movie/` is also present in the above endpoint, just pop the last string
    using the `replace` method or whatever string manipulation bullshit React Native uses

Not my last addition, I still have TV and Cartoons to scrape but it will take a while for me to find the energy again

I hope these endpoints will serve you, just don't abuse the request; and please use urllib for crying out loud, axios fucking sucks

I trust you, cedric and denny will make this project a bit better for others.

I hope the code found inside this repo will impress kaye.

### end of message

# Fuck you Aldrin, I won't give out the links lol
