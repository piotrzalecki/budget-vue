<template>
    <div class="container">
        <div class="row">
            <div class="col mb-1 mt-3">
                <h1 class="float-start">Budgets</h1>
                <router-link class="btn btn-success float-end" :to="`/admin/dashboard/budgets/0`">New budget</router-link>
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
                    <tr v-for="b in budgets" :key="b.id">
                        <!-- <td>
                            <router-link :to="`/admin/users/${u.id}`">{{ u.last_name }}, {{ u.first_name }}</router-link>
                        </td> -->
                        <td>{{ b.name }}</td>
                        <td>{{ b.description }}</td>
                        <td>
                            <router-link class="btn btn-warning" :to="`/admin/dashboard/budgets/${b.id}`">EDIT</router-link>
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
    name: 'AppBudgets',
    props: {},
    emits: ['error'],

    setup(props, cxt) {
        let ready = ref(false);
        let budgets = ref({})

        onBeforeMount(() => { Security.requireToken()})
        onMounted(() => {
            fetch(process.env.VUE_APP_API_URL + "/admin/dashboard/budgets", Security.requestOptions())
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    cxt.emit('error', response.message)
                } else {
                    budgets.value = response.data.budgets;
                    ready.value = true;
                }
            }).catch(error => {
                cxt.emit('error', error)
            })
        })
        return {
            budgets,
            ready
        }
    }
}
</script>
