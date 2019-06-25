import axios from 'axios';

export default class Gitlab
{
    constructor(token, url)
    {
        this.url = url || 'https://gitlab.com/api/v4/';
        this.axios = axios;
        this.axios.defaults.headers.common['Authorization'] = "Bearer " + token;
    }

    response(success, project, data) {
        return {
            success,
            project,
            data
        };
    }

    async getGroups(params) {
        params = Object.assign({
            all_available: false,
            order_by: 'name',
            sort: 'asc',
            per_page: 100,
            page: 1
        }, params);

        let resp = await this.axios.get(this.url + 'groups', {
            params: params
        });

        return resp.data;
    }

    async getProjects(params) {
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

    async archiveProject(project) {
        try {
            let resp = await this.axios.post(this.url + 'projects/' + project.id + '/archive');
            return this.response(true, project, resp.data);
        } catch (e) {
            return this.response(false, project, e);
        }
    }

    async unarchiveProject(project) {
        try {
            let resp = await this.axios.post(this.url + 'projects/' + project.id + '/unarchive');
            return this.response(true, project, resp.data);
        } catch (e) {
            return this.response(false, project, e);
        }
    }

    async transferProject(project, params)
    {
        try {
            let resp = await this.axios.put(this.url + 'projects/' + project.id + '/transfer', params);
            return this.response(true, project, resp.data);
        } catch (e) {
            return this.response(false, project, e);
        }
    }

    async deleteProject(project)
    {
        try {
            let resp = await this.axios.delete(this.url + 'projects/' + project.id);
            return this.response(true, project, resp.data);
        } catch (e) {
            return this.response(false, project, e);
        }
    }
}