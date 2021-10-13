const { google } = require('googleapis')
const { auth } = require('google-auth-library')
const sqladmin = google.sqladmin('v1beta4')

/**
 * Triggered from a Pub/Sub topic.
 * 
 * The input must be as follows:
 * {
 *   "project": "PROJECT_ID",
 *   "database": "DATABASE_NAME",
 *   "bucket": "BUCKET_NAME_WITH_OPTIONAL_PATH_WITHOUT_TRAILING_SLASH"
 * }
 *
 * @param {!Object} event Event payload
 * @param {!Object} context Metadata for the event
 */

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; 
var yyyy = today.getFullYear();

if(dd<10) 
{
    dd='0'+dd;
} 

if(mm<10) 
{
    mm='0'+mm;
} 

exports.initiateBackup = async (event, context) => {
        const pubsubMessage = JSON.parse(Buffer.from(event.data, 'base64').toString())
        const authRes = await auth.getApplicationDefault()
        const request = {
                auth: authRes.credential,
                project: pubsubMessage['project'],
                instance: pubsubMessage['database'],
                resource: {
                        exportContext: {
                                kind: 'sql#exportContext',
                                fileType: 'SQL',
                                uri: pubsubMessage['bucket'] + '/backup-' +dd+'-'+mm+'-'+yyyy + '.gz'
                        }
                }
        }
        sqladmin.instances.export(request, (err, res) => {
                if (err) console.error(err)
                if (res) console.info(res)
        })
}
