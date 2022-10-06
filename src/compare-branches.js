import {get} from './github-request.js';
import editChangeLog from './change-file.js';


function listCommits(commits, branch, lastTag, sha) {
    const list = [];

    commits.forEach(commit => {
        list.push(commit.commit.message);
    });

    editChangeLog(list, branch, lastTag, sha)
}

function compare(branch, lastTag = undefined, sha) {
    if (lastTag) {
        get(`/compare/${lastTag}...${branch}`).then(data => {
            if (data.data.commits && data.data.commits.length === 0) {
                throw Error(`Commits not found.`)
            }

            listCommits(data.data.commits, branch, lastTag, sha)
        }).catch(err => {
            throw Error(`Commits not found between branch ${branch} and tag ${lastTag}`)
        })
    } else {
        get(`/commits`).then(data => {
            if (data.data && data.data.length === 0) {
                throw Error(`Commits not found.`)
            }

            listCommits(data.data, branch, lastTag, sha)
        }).catch(err => {
            throw Error(`Commits not found.`)
        })
    }
}

export default compare;
