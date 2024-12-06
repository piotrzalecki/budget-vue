<template>
    <div class="container">
        <div class="row">
            <div class="col mb-1 mt-3">
                <h1 class="float-start">Transaction Details</h1>
            </div>
            <hr>
            <div v-if="ready">
                <dl  class="row">
                    <dt class="col-sm-3">Id</dt>
                    <dd class="col-sm-9">{{ transaction.id }}</dd>

                    <dt class="col-sm-3">Name</dt>
                    <dd class="col-sm-9">{{ transaction.name }}</dd>

                    <dt class="col-sm-3">Description</dt>
                    <dd class="col-sm-9">{{ transaction.description }}</dd>

                    <dt class="col-sm-3">Budget</dt>
                    <dd class="col-sm-9">{{ transaction.budget.name }}</dd>

                    <dt class="col-sm-3">Quote</dt>
                    <dd class="col-sm-9">{{ transaction.quote }}</dd>

                    <dt class="col-sm-3">Transaction Recurrence</dt>
                    <dd class="col-sm-9">{{ transaction.transaction_recurrence.name }}</dd>

                    <dt class="col-sm-3">Active</dt>
                    <dd class="col-sm-9">{{ transaction.active }}</dd>

                    <dt class="col-sm-3">Starts</dt>
                    <dd class="col-sm-9">{{ transaction.starts }}</dd>

                    <dt class="col-sm-3">Ends</dt>
                    <dd class="col-sm-9">{{ transaction.ends }}</dd>

                    <dt class="col-sm-3">Tag</dt>
                    <dd class="col-sm-9">{{ transaction.tag.name }}</dd>

                    <dt class="col-sm-3">Last change</dt>
                    <dd class="col-sm-9">{{ transaction.updated_at }}</dd>
                </dl>
                            
                
                    <div class="float-start">
                        <router-link to="/admin/dashboard/transactions" class="btn btn-outline-secondary me-2">Cancel</router-link>
                        <router-link class="btn btn-warning" :to="`/admin/dashboard/transactions/edit/${transaction.id}`">EDIT</router-link>
                    </div>
                    <div class="float-end">
                        <a v-if="transaction.id > 0" class="btn btn-danger" href="javascript:void(0);" @click="confirmDelete(transaction.id)">Delete</a>
                    </div>
                    <div class="clearfix"></div>
            </div>
            <div v-else>
                Loading...
            </div>
        </div>
    </div>
</template>

<script>
import {ref, onMounted, onBeforeMount} from 'vue'
import Security from './security.js'
import { useRoute } from 'vue-router';
import router from '../router/index.js'
import notie from 'notie'

export default {
    name: 'AppTransactionDetails',
    props: {},
    emits: ['error'],

    setup(props, cxt) {
        let ready = ref(false);
        let transaction = ref({})
        const route = useRoute();

        onBeforeMount(() => { Security.requireToken()})
        onMounted(() => {
            fetch(process.env.VUE_APP_API_URL + `/admin/dashboard/transactions/${route.params.transactionId}`, Security.requestOptions())
            .then((response) => response.json())
            .then((response) => {
                if (response.error) {
                    cxt.emit('error', response.message)
                } else {
                    transaction.value = response.data;
                    ready.value = true;
                }
            }).catch(error => {
                cxt.emit('error', error)
            })
        })

        function confirmDelete(id){
            notie.confirm({
                text: "Are you sure you want to delete this transaction?",
                submitText: "Delete",
                submitCallback: () => {
                    let payload = {
                        id: id,
                    }

                    
                    fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/transactions`, Security.requestOptions(payload, "DELETE"))
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            cxt.emit('error', data.message)
                        } else {
                            cxt.emit('success', 'Transaction deleted!')
                            router.push("/admin/dashboard/transactions")
                        }
                    }).catch((error) => {
                        cxt.emit('error', error)
            })
                }
            })
        }
        return {
            transaction,
            ready,
            confirmDelete
        }
    }
}
</script>
