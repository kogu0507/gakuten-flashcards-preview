import {naturalTriadTargets} from '../triad-natural-roots-meta.js';
import {triadName,triadCodeName} from '../chord-terminology.js';
const kindQuestion='和音の種類を答えなさい。';
const codeQuestion='コードネームを答えなさい。';
export default {
  id:'triad-identification',
  cards:[...naturalTriadTargets.map((target,index)=>{
    const term=triadName(target.quality);
    return {id:target.id,label:`和音の種類 譜例${index+1}`,prompt:kindQuestion,answer:`${term.jp} / ${term.en} / ${term.de}`,
      promptContent:[{type:'triad-notation',question:kindQuestion,assetId:target.assetId}],
      answerContent:[{type:'chord-quality',quality:target.quality}],
      tags:['chord','triad','root-position','natural-root','quality-question'],meta:{task:'quality',quality:target.quality,root:target.root.toLowerCase(),rootOctave:4,position:'root'}};
  }),...naturalTriadTargets.map((target,index)=>({
    id:target.codeId,label:`コードネーム 譜例${index+1}`,prompt:codeQuestion,answer:triadCodeName(target.root,target.quality),
    promptContent:[{type:'triad-notation',question:codeQuestion,assetId:target.assetId}],
    answerContent:[{type:'chord-symbol',quality:target.quality,root:target.root}],
    tags:['chord','triad','root-position','natural-root','code-question'],meta:{task:'code',quality:target.quality,root:target.root.toLowerCase(),rootOctave:4,position:'root'}
  }))]
};
