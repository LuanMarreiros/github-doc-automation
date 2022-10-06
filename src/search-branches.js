import compare from './compare-branches.js';
import {get} from './github-request.js';

function filterBranches(branches) {
    let branchName = undefined;
    let branchSHA = '';

    branches.forEach(branch => {
        switch (branch.name) {
            case 'main': {
                branchName = 'main';
                branchSHA = branch.commit.sha;
                break;
            }
            case 'master': {
                branchName = 'master';
                branchSHA = branch.commit.sha;
                break;
            }
        }
    });

    if (!branchName) {
        throw new Error("Branch main or master do not found.");
    }

    return `${branchName}-${branchSHA}`;
}

function searchTags(branch) {
    get('/tags').then(data => {
        console.log()
        if (data.data && data.data.length !== 0) {
            compare(branch.split('-')[0], data.data[0].name, branch.split('-')[1]);
        } else {
            compare(branch.split('-')[0], undefined, branch.split('-')[1]);
        }
    }).catch(err => {
        throw Error(`Rota: /tags, status: ${err?.response?.status}`)
    })
}

function searchBranches() {
    get('/branches').then(data => {
        searchTags(filterBranches(data.data));
    }).catch(err => {
        throw Error(`Rota: /branches, status: ${err?.response?.status}`)
    })
}

export default searchBranches;
