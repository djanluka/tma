# TMA - Kinesis Events

AWS Kinesis handler that will build and maintain entities representing a gambling limit that a user set on his account based on the events received from the stream.

## ⚙️ Prerequisites  

**Only Docker is needed!** 

Before you begin, ensure you have:  
- [Docker](https://www.docker.com/) installed and running  

That's it! Everything else runs inside containers. 🐳  

## 🚀 Getting Started  
- Start the program using just one command!
```
docker build -t tma-app . && docker run -it --rm tma-app
```

If you want to separate build and run flow then:
- Build the image:
```
docker build -t tma-app .
```
- Run the image: 
```
docker run -it --rm tma-app
```

### For development
- Install [npm](https://www.npmjs.com/)
- Install `typescript` globally to use `tsc` command anywhere:
```
npm install -g typescript
```
- Install all dependencies:
```
npm install
```
- Start test (see `package.json` -> `script`):
```
npm run test
```