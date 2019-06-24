import Cookies from 'js-cookie';
import axios from 'axios';
import Vue from 'vue';



class Gitlab
{
    constructor(token, url) {
        this.url = url || 'https://gitlab.com/api/v4/';
        this.axios = axios;
        this.axios.defaults.headers.common['Authorization'] = "Bearer " + token;
    }

    async getProjects(params) {
        console.log('AXIOS', this.axios);
        params = Object.assign({
            owned: true,
            order_by: 'name',
            sort: 'asc',
            per_page: 20,
            page: 1
        }, params);

        let resp = await this.axios.get(this.url + 'projects', {
            params: params
        });

        return resp.data;
    }
}


async function main() {
    window.app = new Vue({
        el: "#app",
        data: () => {
            return {
                page: 1,
                per_page: 20,
                loading: false,

                projects: {},
                selectedProjects: [],
                token: null,

                bulkAction: null
            }
        },

        watch: {
            page: 'loadProjects'
        },

        mounted: async function() {
            this.token = Cookies.get('GITLAB_ACCESS_TOKEN');
            this.gitlab = new Gitlab(this.token);
            this.loadProjects();
        },

        methods: {
            authenticate() {
                window.location.href = '/auth.php';
            },

            prevPage() {
                if (this.page > 1) this.page--;
            },

            nextPage() {
                if (this.projects.length == this.per_page) this.page++;
            },

            async loadProjects() {
                this.loading = true;
                this.projects = await this.gitlab.getProjects({page: this.page});
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
                let queue = [];

                for (let project of this.selectedProjects) {
                    // let request = this.gitlab[this.action](project);
                    let request = new Promise((res, rej) => {});
                    this.$set(project, 'processing', true);
                    console.log('Project', project);

                    queue.push(request);
                }

                let results = await Promise.all(queue);

                for (let result of results) {
                    console.log('Result', result);
                }
            },

        }
    });

}

main()