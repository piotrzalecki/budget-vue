<template>
    <div class="container">
        <div class="row">
            <div class="col mb-1 mt-3">
                <h1 class="float-start">Transactions Recurrences</h1>
                <router-link class="btn btn-success float-end" :to="`/admin/dashboard/transactions-recurrences/new`">New TR</router-link>
            </div>
            <hr>
            <table v-if="ready" class="table table-compact table-stripped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Add Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tr in tRecs" :key="tr.id">
                        <td>{{ tr.name }}</td>
                        <td>{{ tr.description }}</td>
                        <td>{{ tr.add_time }}</td>
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
    name: 'AppTransactionRecurrences',
    props: {},
    emits: ['error'],

    setup(props, cxt) {
        let ready = ref(false);
        let tRecs = ref({})

        onBeforeMount(() => { Security.requireToken()})
        onMounted(() => {
            fetch(process.env.VUE_APP_API_URL + "/admin/dashboard/transactions-recurrences", Security.requestOptions())
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    cxt.emit('error', response.message)
                } else {
                    tRecs.value = response.data.transaction_recurrences;
                    ready.value = true;
                }
            }).catch(error => {
                cxt.emit('error', error)
            })
        })
        return {
            tRecs,
            ready
        }
    }
}
</script>
