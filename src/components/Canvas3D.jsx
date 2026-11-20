import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { SceneManager } from '../three/scene.js';
import { Environment } from '../three/environment.js';
import { CrowdManager } from '../three/crowd.js';
import { KrathongManager } from '../three/krathong.js';

const Canvas3D = forwardRef(function Canvas3D({ contestants, onSelectKrathong }, ref) {
  const containerRef = useRef(null);
  const managersRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sceneManager = new SceneManager(containerRef.current, (contestant) => {
      if (onSelectKrathong) {
        onSelectKrathong(contestant);
      }
    });

    const environment = new Environment(sceneManager.scene);
    const crowd = new CrowdManager(sceneManager.scene);
    const krathongManager = new KrathongManager(sceneManager.scene);

    if (contestants && contestants.length > 0) {
      krathongManager.loadAll(contestants);
    }

    sceneManager.setInteractiveObjects(krathongManager.interactiveMeshes);

    sceneManager.render((time, delta) => {
      environment.update(time, delta);
      crowd.update(time, delta);
      krathongManager.update(time, delta);
    });

    managersRef.current = {
      sceneManager,
      environment,
      crowd,
      krathongManager
    };

    return () => {
      sceneManager.destroy();
    };
  }, []);

  // Synchronize 3D meshes whenever contestants list changes (e.g. from Firestore)
  useEffect(() => {
    if (managersRef.current && contestants) {
      const { krathongManager, sceneManager } = managersRef.current;
      krathongManager.syncWithList(contestants);
      sceneManager.setInteractiveObjects(krathongManager.interactiveMeshes);
    }
  }, [contestants]);

  useImperativeHandle(ref, () => ({
    addNewKrathong: (contestant) => {
      if (managersRef.current) {
        const { krathongManager, sceneManager } = managersRef.current;
        // Clean out all other krathongs from river and float only this krathong
        const meshGroup = krathongManager.addNewOnly(contestant);
        sceneManager.setInteractiveObjects(krathongManager.interactiveMeshes);
        setTimeout(() => {
          sceneManager.focusOnKrathong(meshGroup.position);
          krathongManager.highlight(contestant.id);
        }, 200);
        return meshGroup;
      }
    },
    focusOnKrathong: (id) => {
      if (managersRef.current) {
        const { krathongManager, sceneManager } = managersRef.current;
        const entry = krathongManager.krathongMap.get(id);
        if (entry) {
          sceneManager.focusOnKrathong(entry.group.position);
          krathongManager.highlight(id);
        }
      }
    },
    resetCamera: () => {
      if (managersRef.current) {
        managersRef.current.sceneManager.resetCamera();
        managersRef.current.krathongManager.resetHighlight();
      }
    },
    highlightKrathong: (id) => {
      if (managersRef.current) {
        managersRef.current.krathongManager.highlight(id);
      }
    },
    resetHighlight: () => {
      if (managersRef.current) {
        managersRef.current.krathongManager.resetHighlight();
      }
    }
  }));

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0 overflow-hidden"
    />
  );
});

export default Canvas3D;
