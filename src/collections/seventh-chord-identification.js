import {seventhPilotTargets} from '../seventh-chord-meta.js';
import {seventhName,seventhCodeName} from '../seventh-chord-terminology.js';
const kindQuestion='和音の種類を答えなさい。',codeQuestion='コードネームを答えなさい。';
export default {id:'seventh-chord-identification',cards:[
  ...seventhPilotTargets.map((target,index)=>{
    const term=seventhName(target.quality);
    return {id:target.id,label:`和音の種類 譜例${index+1}`,prompt:kindQuestion,answer:`${term.jp} / ${term.en} / ${term.de}`,
      promptContent:[{type:'seventh-notation',question:kindQuestion,assetId:target.assetId}],answerContent:[{type:'seventh-quality',quality:target.quality}],
      tags:['chord','seventh','root-position','natural-root','quality-question'],meta:{task:'quality',quality:target.quality,root:'c',rootOctave:4,position:'root'}};
  }),
  ...seventhPilotTargets.map((target,index)=>({id:target.codeId,label:`コードネーム 譜例${index+1}`,prompt:codeQuestion,answer:seventhCodeName(target.root,target.quality),
    promptContent:[{type:'seventh-notation',question:codeQuestion,assetId:target.assetId}],answerContent:[{type:'seventh-symbol',quality:target.quality,root:target.root}],
    tags:['chord','seventh','root-position','natural-root','code-question'],meta:{task:'code',quality:target.quality,root:'c',rootOctave:4,position:'root'}}))
]};
