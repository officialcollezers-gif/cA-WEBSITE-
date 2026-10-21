import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rebrandLegacyContent } from '../server/branding.js';
import { assemble } from '../server/content.js';
test('existing Sheet branding renders the requested name without changing IDs or source records',()=>{
 const record={id:'fincore',slug:'fincore-advisory',name:'FinCore Advisors',author:'FinCore Editorial Team',nested:[{overview:'At FinCore Advisors, we help businesses.'}],status:'published'};
 const changed=rebrandLegacyContent(record);
 assert.equal(changed.name,'RAHUL G & ASSOCIATES');assert.equal(changed.id,record.id);assert.equal(changed.slug,record.slug);
 assert.equal(changed.author,'RAHUL G & ASSOCIATES Editorial Team');assert.match(changed.nested[0].overview,/RAHUL G & ASSOCIATES/);
 assert.equal(record.name,'FinCore Advisors');
 const content=assemble([['settings','site',JSON.stringify({...record,id:'site'})]],true);
 assert.equal(content.settings.name,'RAHUL G & ASSOCIATES');
});
