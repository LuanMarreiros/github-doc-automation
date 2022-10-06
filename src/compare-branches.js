const axios = require('axios');
const http = require('./github-request');
const changeFile = require('./change-file');

function listCommits(commits, branch, lastTag, sha) {
    const list = [];

    commits.forEach(commit => {
        list.push(commit.commit.message);
    });

    changeFile.editChangeLog(list, branch, lastTag, sha)
}

function compare(branch, lastTag = undefined, sha) {
    if (lastTag) {
        http.get(`/compare/${lastTag}...${branch}`).then(data => {
            if (data.data.commits && data.data.commits.length === 0) {
                throw Error(`Commits not found.`)
            }

            listCommits(data.data.commits, branch, lastTag, sha)
        }).catch(err => {
            throw Error(`Rota: /compare/${lastTag}...${branch}, status: ${err?.response?.status}`)
        })
    }else{
        http.get(`/commits`).then(data => {
            if (data.data && data.data.length === 0) {
                throw Error(`Commits not found.`)
            }

            listCommits(data.data, branch, lastTag, sha)
        }).catch(err => {
            throw Error(`Rota: /compare/${lastTag}...${branch}, status: ${err?.response?.status}`)
        })
    }
}

module.exports = { compare }