# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Usage

This project is meant for visualizing graph data and learning about some elementary graph algorithms.\
One needs to upload a txt file to specify a graph. This can be done explicitly, for example:\
V={v1,v2,v3,v4,v5}\
E={(v1,1,v2),(v2,1,v1),(v1,1,v3),(v3,1,v1),(v2,1,v3),(v3,1,v2),(v3,1,v4),(v4,1,v3),(v4,1,v5),(v5,1,v4)}\
where (vi,w,vj) means that there is a directed edge from vertex vi to vj with weight w. If an equal edge exists in both directions, then the edge will be rendered as undirected.\
If one does not wish to produce an explicit txt file to specify the graph, it is also possible to upload a txt file with actual text. In that case, the sentences will get mapped to nodes and there will be an edge between nodes whose corresponding sentences share some words.\
Demonstration video is available at: [https://drive.google.com/file/d/1qbuU-6p7rBf7Vt_zFPNgxsJIjVjFfE_J/view?usp=sharing](https://drive.google.com/file/d/1CNQRmfgmYbh1m7vZhzH3HOWFkfVeawB4/view?usp=sharing)
