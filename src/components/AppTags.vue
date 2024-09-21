<template>
    <div class="container">
        <div class="row">
            <div class="col mb-1 mt-3">
                <h1 class="float-start">Tags</h1>
                <router-link class="btn btn-success float-end" :to="`/admin/dashboard/tags/0`">New tag</router-link>
            </div>
            <hr>
            <table v-if="ready" class="table table-compact table-stripped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="t in tags" :key="t.id">
                        <!-- <td>
                            <router-link :to="`/admin/users/${u.id}`">{{ u.last_name }}, {{ u.first_name }}</router-link>
                        </td> -->
                        <td>{{ t.name }}</td>
                        <td>{{ t.description }}</td>
                        <td>
                            <router-link class="btn btn-warning" :to="`/admin/dashboard/tags/${t.id}`">EDIT</router-link>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-else>
                Loading...
            </div>
        </div>
    </div>
</template>

<script>
import {ref, onMounted, onBeforeMount} from 'vue'
import Security from './security.js'
export default {
    name: 'AppTags',
    props: {},
    emits: ['error'],

    setup(props, cxt) {
        let ready = ref(false);
        let tags = ref({})

        onBeforeMount(() => { Security.requireToken()})
        onMounted(() => {
            fetch(process.env.VUE_APP_API_URL + "/admin/dashboard/tags", Security.requestOptions())
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    cxt.emit('error', response.message)
                } else {
                    console.log(response.data.tags)
                    tags.value = response.data.tags;
                    ready.value = true;
                    console.log(tags.value)
                }
            }).catch(error => {
                cxt.emit('error', error)
            })
        })
        return {
            tags,
            ready
        }
    }
}
</script>
