import Cookies from 'js-cookie';
import axios from 'axios';
import Vue from 'vue';
import Gitlab from './gitlab'


const actions = [
    {
        name: 'deleteProject',
        title: 'Delete',
        success: {
            message: 'Project was deleted',
            callback: function (result) {
                setTimeout(() => {
                    this.projects.splice(
                        this.projects.indexOf(result.project), 1
                    );
                }, 3000);
            }
        },

        error: {
            message: 'Could not delete project.',
        }
    },

    {
        name: 'archiveProject',
        title: 'Archive',
        success: {
            message: 'Project was archived',
        },

        error: {
            message: 'Could not archive project.',
        }

    },

    {
        name: 'unarchiveProject',
        title: 'Unarchive',
        success: {
            message: 'Project was unarchived',
        },

        error: {
            message: 'Could not unarchive project.',
        }
    },

    {
        name: 'transferProject',
        title: 'Transfer',
        success: {
            message: 'Project was transferred',
        },

        error: {
            message: 'Could not transfer project.',
        }

    }
];

window.app = new Vue({
    el: "#app",
    data: () => {
        return {
            paging: {
                page: 1,
                per_page: 20,
                has_more: false
            },

            authError: null,
            gitlabHost: 'https://gitlab.com',

            loading: false,
            actions: actions,

            groups: {},
            projects: {},
            selectedProjects: [],
            token: null,

            bulkAction: null,
            actionParams: {

            }
        }
    },

    watch: {
        'paging.page': 'loadProjects'
    },

    mounted: async function() {
        this.token = Cookies.get('GITLAB_ACCESS_TOKEN');
        console.log('Token', this.token);

        if (this.token == null) return;

        this.gitlabHost = new Gitlab(this.token);

        try {
            this.groups = await this.gitlab.getGroups();
        } catch (e) {
            console.error('Could not load groups');
        }

        this.loadProjects();
    },

    methods: {
        validateHost(event) {
            event.preventDefault();

            // Copyright (c) 2010-2013 Diego Perini, MIT licensed
            // https://gist.github.com/dperini/729294
            if (/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(this.gitlabHost) == false) {
                this.authError = 'Invalid URL'
                return;
            }

            this.loading = true;

            try {
                this.gitlabHost = this.gitlabHost.replace(/\/$/, "");
                let resp = axios.get(this.gitlabHost + '/help')
                console.log('Resp', resp);

                if (typeof resp.data.version == 'undefined') {
                    this.authError = 'Cannot connect to GitLab host. Unexpected respons.';
                    console.error('Response', resp);
                    this.loading = false;
                    return;
                }

                console.log('Valid url');

                // window.location.href = '/auth.php';
            } catch (e) {
                this.authError = 'Cannot connect to GitLab host: ' + e.message;
            }

            this.loading = false;
        },

        prevPage() {
            if (this.paging.page > 1) this.paging.page--;
        },

        nextPage() {
            if (this.paging.has_more) this.paging.page++;
        },

        async loadProjects() {
            this.loading = true;
            this.projects = await this.gitlab.getProjects({page: this.paging.page});

            if (this.projects.length == this.paging.per_page) {
                this.paging.has_more = true;
            }

            this.loading = false;
        },

        toggleProject (project) {
            let index = this.selectedProjects.indexOf(project);

            if (index >= 0) {
                this.selectedProjects.splice(index, 1);
            } else {
                this.selectedProjects.push(project);
            }
        },

        projectSelected(p) {
            return this.selectedProjects.indexOf(p) >= 0;
        },

        toggleAll() {
            if (this.selectedProjects.length == 0) {
                for (let p of this.projects) {
                    this.selectedProjects.push(p);
                }
            } else {
                this.selectedProjects = [];
            }
        },

        async bulkApply () {
            let action = this.bulkAction;
            let queue = [];

            if (action == null) return;

            if (confirm('Do you want to execute "' + action.title + '" for ' + this.selectedProjects.length + ' project(s). This CANNOT be undone.') == false) return;

            while (this.selectedProjects.length > 0) {
                let project = this.selectedProjects[0];
                let request = this.gitlab[action.name](project, this.actionParams);

                this.$set(project, 'processing', true);
                this.selectedProjects.splice(0, 1);
                queue.push(request);
            }

            let results = await Promise.all(queue);

            for (let result of results) {
                if (result.success == true) {
                    result.project = Object.assign(result.project, result.data);
                    this.$set(result.project, 'message', action.success.message);

                    if (typeof action.success.callback == 'function') {
                        action.success.callback.call(this, result);
                    }

                    setTimeout(() => {
                        this.$set(result.project, 'message', null);
                    }, 3000);
                } else {
                    this.$set(result.project, 'message', 'Error: ' + action.error.message + ' (' + result.data.response.data.error + ')');

                    if (typeof action.error.callback == 'function') {
                        action.error.callback.call(this, result);
                    }
                }

                result.project.processing = false;
            }
        },

    }
});
