/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import './index.scss';

import moment from 'moment';
import React, { useEffect, useState } from 'react';

import { CustomThemeProvider, CustomThemeType } from '../../../themes';
import { FirestoreRulesEvaluation } from './rules_evaluation_result_model';
import { registerForRulesEvents } from './rules_evaluations_listener';

interface RulesOutcomeData {
  [outcome: string]: {
    theme: CustomThemeType;
    label: string;
  };
}

export const RulesList: React.FC<{}> = () => {
  const [evaluations, setEvaluations] = useState<FirestoreRulesEvaluation[]>(
    []
  );

  useEffect(() => {
    const callbackFunction = (newEvaluation: FirestoreRulesEvaluation) =>
      setEvaluations(evaluations => [newEvaluation, ...evaluations]);
    const unsubscribeFromRules = registerForRulesEvents(callbackFunction);
    return () => unsubscribeFromRules();
  }, []);

  return (
    <div className="Firestore-Rules-List">
      <div className="Firestore-Rules-List-Container">
        {evaluations.map(
          (evaluation: FirestoreRulesEvaluation, index: number) => {
            const { rulesContext, outcome } = evaluation;
            const resourcePath = (rulesContext?.request?.path || '').replace(
              '/databases/(default)/documents',
              ''
            );
            const requestTime = rulesContext?.request?.time;
            const outcomeData: RulesOutcomeData = {
              allow: { theme: 'success', label: 'ALLOW' },
              deny: { theme: 'warning', label: 'DENY' },
              error: { theme: 'note', label: 'ERROR' },
            };
            return (
              <div key={index} className="Firestore-Rules-List-Element">
                <CustomThemeProvider use={outcomeData[outcome]?.theme} wrap>
                  <div
                    className="Firestore-Rules-List-Circle"
                    title={outcomeData[outcome]?.label || ''}
                  />
                </CustomThemeProvider>
                <div className="Firestore-Rules-List-Info">
                  <div className="Firestore-Rules-List-Path">
                    {resourcePath}
                  </div>
                  <div className="Firestore-Rules-List-Date">
                    {moment(requestTime).format('MMMM Do YYYY, h:mm:ss A')}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default RulesList;
